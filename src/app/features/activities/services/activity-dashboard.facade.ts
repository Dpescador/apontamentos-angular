import { Injectable, computed, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ModalService } from '../../../core/services/modal.service';
import {
  addDays,
  formatDate,
  formatHours,
  isWeekday,
  parseLocalDate,
  startOfWeek,
  toIsoDate
} from '../../../shared/utils/date.utils';
import { createId } from '../../../shared/utils/id.utils';
import { ActivityFormGroup } from '../models/activity-form.model';
import { Activity } from '../models/activity.model';
import { ChartDay } from '../models/chart-day.model';
import { ActivityRepositoryService } from './activity-repository.service';

const DAILY_TARGET = 8;
const WEEKLY_TARGET = 40;
const PAGE_SIZE = 20;

@Injectable({ providedIn: 'root' })
export class ActivityDashboardFacade {
  private readonly formBuilder = inject(FormBuilder);
  private readonly modal = inject(ModalService);
  readonly repository = inject(ActivityRepositoryService);

  readonly editingId = signal<string | null>(null);
  readonly searchTerm = signal('');
  readonly referenceDate = signal(this.getInitialReferenceDate());
  readonly showWeekends = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = PAGE_SIZE;

  readonly form: ActivityFormGroup = this.formBuilder.nonNullable.group({
    date: [this.getInitialReferenceDate(), Validators.required],
    sprint: ['', Validators.maxLength(60)],
    taskId: ['', [Validators.required, Validators.maxLength(80)]],
    task: ['', [Validators.required, Validators.maxLength(120)]],
    itemsWorked: ['', Validators.maxLength(160)],
    hours: [1, [Validators.required, Validators.min(0.1), Validators.max(24)]]
  });

  readonly sortedActivities = computed(() => {
    const term = this.normalizeSearch(this.searchTerm());

    return [...this.repository.activities()]
      .filter((activity) => {
        if (!term) {
          return true;
        }

        const searchableValues = [
          ...this.getDateSearchValues(activity.date),
          activity.sprint,
          activity.taskId,
          activity.task,
          activity.itemsWorked,
          String(activity.hours)
        ];

        return searchableValues.some((value) =>
          this.normalizeSearch(value).includes(term)
        );
      })
      .sort((left, right) => {
        const dateComparison = right.date.localeCompare(left.date);
        return dateComparison || right.createdAt.localeCompare(left.createdAt);
      });
  });

  readonly weekStart = computed(() => startOfWeek(parseLocalDate(this.referenceDate())));
  readonly weekEnd = computed(() => addDays(this.weekStart(), 6));
  readonly aggregatedWeekDays = computed(() => this.getAggregatedWeek());
  readonly visibleWeekDays = computed(() =>
    this.aggregatedWeekDays().filter((day) => this.showWeekends() || !day.isWeekend)
  );

  readonly weekMax = computed(() => {
    const values = this.visibleWeekDays().map((day) => day.hours);
    return Math.max(10, Math.ceil(Math.max(0, ...values) + 1));
  });

  readonly weekDays = computed<ChartDay[]>(() => {
    const max = this.weekMax();
    return this.visibleWeekDays().map((day) => ({
      ...day,
      height: (day.hours / max) * 100
    }));
  });

  readonly weekTargetHeight = computed(() => (DAILY_TARGET / this.weekMax()) * 100);
  readonly weekTotal = computed(() =>
    this.aggregatedWeekDays().reduce((sum, day) => sum + day.hours, 0)
  );
  readonly weekBalance = computed(() => this.weekTotal() - WEEKLY_TARGET);
  readonly weekActiveDays = computed(() =>
    this.aggregatedWeekDays().filter((day) => day.hours > 0).length
  );
  readonly weekAverage = computed(() =>
    this.weekActiveDays() ? this.weekTotal() / this.weekActiveDays() : 0
  );

  readonly aggregatedMonthDays = computed(() => this.getAggregatedMonth());
  readonly visibleMonthDays = computed(() =>
    this.aggregatedMonthDays().filter((day) => this.showWeekends() || !day.isWeekend)
  );

  readonly monthMax = computed(() => {
    const values = this.visibleMonthDays().map((day) => day.hours);
    return Math.max(10, Math.ceil(Math.max(0, ...values) + 1));
  });

  readonly monthDays = computed<ChartDay[]>(() => {
    const max = this.monthMax();
    return this.visibleMonthDays().map((day) => ({
      ...day,
      height: (day.hours / max) * 100
    }));
  });

  readonly monthTargetHeight = computed(() => (DAILY_TARGET / this.monthMax()) * 100);
  readonly monthTotal = computed(() =>
    this.aggregatedMonthDays().reduce((sum, day) => sum + day.hours, 0)
  );
  readonly monthExpected = computed(() =>
    this.aggregatedMonthDays()
      .filter((day) => !day.isWeekend && day.date <= this.referenceDate())
      .length * DAILY_TARGET
  );
  readonly monthProgress = computed(() =>
    this.monthExpected()
      ? Math.min(100, (this.monthTotal() / this.monthExpected()) * 100)
      : 0
  );

  readonly weekLabel = computed(() => {
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short'
    });

    return `${formatter.format(this.weekStart())} a ${formatter.format(this.weekEnd())}`;
  });

  readonly monthLabel = computed(() =>
    new Intl.DateTimeFormat('pt-BR', {
      month: 'long',
      year: 'numeric'
    }).format(parseLocalDate(this.referenceDate()))
  );

  readonly totalFilteredHours = computed(() =>
    this.sortedActivities().reduce((sum, activity) => sum + activity.hours, 0)
  );

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.sortedActivities().length / this.pageSize))
  );

  readonly paginatedActivities = computed(() => {
    const safePage = Math.min(this.currentPage(), this.totalPages());
    const start = (safePage - 1) * this.pageSize;
    return this.sortedActivities().slice(start, start + this.pageSize);
  });

  readonly paginationStart = computed(() =>
    this.sortedActivities().length
      ? (Math.min(this.currentPage(), this.totalPages()) - 1) * this.pageSize + 1
      : 0
  );

  readonly paginationEnd = computed(() =>
    Math.min(
      Math.min(this.currentPage(), this.totalPages()) * this.pageSize,
      this.sortedActivities().length
    )
  );

  async submit(): Promise<void> {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      await this.modal.alert({
        title: 'Dados obrigatórios',
        message: 'Preencha a data, o ID da tarefa, selecione a tarefa e informe uma quantidade válida de horas.',
        variant: 'warning',
        confirmText: 'Revisar formulário'
      });
      return;
    }

    const value = this.form.getRawValue();
    const editingId = this.editingId();
    const existing = editingId
      ? this.repository.findById(editingId)
      : undefined;
    const now = new Date().toISOString();

    const activity: Activity = {
      id: existing?.id ?? createId(),
      date: value.date,
      sprint: value.sprint.trim(),
      taskId: value.taskId.trim(),
      task: value.task.trim(),
      itemsWorked: value.itemsWorked.trim(),
      hours: Number(value.hours),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now
    };

    await this.repository.upsert(activity);
    this.referenceDate.set(activity.date);
    this.currentPage.set(1);
    this.cancelEdit();

    await this.modal.alert({
      title: existing ? 'Apontamento atualizado' : 'Apontamento adicionado',
      message: existing
        ? 'As alterações foram salvas com sucesso.'
        : 'A atividade foi adicionada ao histórico com sucesso.',
      variant: 'success',
      confirmText: 'Continuar'
    });
  }

  edit(activity: Activity): void {
    const selected = this.repository.findById(activity.id) ?? activity;

    this.referenceDate.set(selected.date);
    this.editingId.set(selected.id);
    this.form.reset(
      {
        date: selected.date,
        sprint: selected.sprint ?? '',
        taskId: selected.taskId ?? '',
        task: selected.task ?? '',
        itemsWorked: selected.itemsWorked ?? '',
        hours: Number(selected.hours)
      },
      { emitEvent: false }
    );
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  async remove(activity: Activity): Promise<void> {
    const confirmed = await this.modal.confirm({
      title: 'Excluir apontamento?',
      message: `O apontamento de ${formatDate(activity.date)}, com ${formatHours(activity.hours)} hora(s), será removido permanentemente.`,
      variant: 'danger',
      confirmText: 'Excluir',
      cancelText: 'Cancelar'
    });

    if (!confirmed) {
      return;
    }

    await this.repository.remove(activity.id);

    if (this.editingId() === activity.id) {
      this.cancelEdit();
    }

    this.currentPage.set(Math.min(this.currentPage(), this.totalPages()));

    await this.modal.alert({
      title: 'Apontamento excluído',
      message: 'O registro foi removido do histórico.',
      variant: 'success',
      confirmText: 'Continuar'
    });
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.form.reset({
      date: this.referenceDate(),
      sprint: '',
      taskId: '',
      task: '',
      itemsWorked: '',
      hours: 1
    });
  }

  changeReferenceDate(value: string): void {
    if (value) {
      this.referenceDate.set(value);
    }
  }

  changeSearch(value: string): void {
    this.searchTerm.set(value);
    this.currentPage.set(1);
  }

  toggleWeekends(): void {
    this.showWeekends.update((value) => !value);
  }

  navigatePage(page: number): void {
    this.currentPage.set(Math.max(1, Math.min(page, this.totalPages())));
  }

  navigateWeek(offset: number): void {
    const date = addDays(parseLocalDate(this.referenceDate()), offset * 7);
    this.referenceDate.set(toIsoDate(date));
  }

  navigateMonth(offset: number): void {
    const date = parseLocalDate(this.referenceDate());
    date.setMonth(date.getMonth() + offset, 1);
    this.referenceDate.set(toIsoDate(date));
  }

  async connectTxt(): Promise<void> {
    const previousStatus = this.repository.fileStatus();
    await this.repository.connectTxt();
    const currentStatus = this.repository.fileStatus();

    if (currentStatus !== previousStatus) {
      await this.modal.alert({
        title: this.repository.isFileLinked()
          ? 'Arquivo TXT vinculado'
          : 'Atenção ao arquivo TXT',
        message: currentStatus,
        variant: this.repository.isFileLinked() ? 'success' : 'warning',
        confirmText: 'Continuar'
      });
    }
  }

  async syncTxt(): Promise<void> {
    const previousStatus = this.repository.fileStatus();
    await this.repository.syncNow();
    const currentStatus = this.repository.fileStatus();

    if (currentStatus !== previousStatus || this.repository.isFileLinked()) {
      await this.modal.alert({
        title: this.repository.isFileLinked()
          ? 'Sincronização concluída'
          : 'Não foi possível sincronizar',
        message: currentStatus,
        variant: this.repository.isFileLinked() ? 'success' : 'warning',
        confirmText: 'Continuar'
      });
    }
  }

  async exportTxt(): Promise<void> {
    this.repository.exportTxt();
    await this.modal.alert({
      title: 'Arquivo exportado',
      message: 'Uma cópia do arquivo apontamentos.txt foi gerada para download.',
      variant: 'success',
      confirmText: 'Continuar'
    });
  }

  async importFile(file: File): Promise<void> {
    try {
      await this.repository.importTxt(file);
      this.currentPage.set(1);
      await this.modal.alert({
        title: 'Importação concluída',
        message: `Os dados de ${file.name} foram carregados com sucesso.`,
        variant: 'success',
        confirmText: 'Continuar'
      });
    } catch (error: unknown) {
      console.error(error);
      await this.modal.alert({
        title: 'Falha na importação',
        message: 'O arquivo selecionado não possui o formato esperado. Verifique o conteúdo e tente novamente.',
        variant: 'danger',
        confirmText: 'Entendi'
      });
    }
  }

  private normalizeSearch(value: string | number | null | undefined): string {
    return String(value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR')
      .trim();
  }

  private getDateSearchValues(date: string): string[] {
    if (!date) {
      return [];
    }

    const [year, month, day] = date.split('-');
    if (!year || !month || !day) {
      return [date];
    }

    return [
      date,
      `${day}/${month}/${year}`,
      `${day}-${month}-${year}`,
      `${day}/${month}`,
      `${day}-${month}`,
      `${day}${month}${year}`
    ];
  }

  private getInitialReferenceDate(): string {
    const latestDate = [...this.repository.activities()]
      .map((activity) => activity.date)
      .sort((left, right) => right.localeCompare(left))[0];

    return latestDate ?? toIsoDate(new Date());
  }

  private getAggregatedWeek(): Omit<ChartDay, 'height'>[] {
    const totals = this.aggregateByDate();
    const dayFormatter = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' });

    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(this.weekStart(), index);
      const isoDate = toIsoDate(date);

      return {
        date: isoDate,
        dayName: dayFormatter.format(date).replace('.', ''),
        dayNumber: String(date.getDate()).padStart(2, '0'),
        hours: totals.get(isoDate) ?? 0,
        isWeekend: !isWeekday(date)
      };
    });
  }

  private getAggregatedMonth(): Omit<ChartDay, 'height'>[] {
    const reference = parseLocalDate(this.referenceDate());
    const year = reference.getFullYear();
    const month = reference.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const totals = this.aggregateByDate();
    const dayFormatter = new Intl.DateTimeFormat('pt-BR', { weekday: 'narrow' });

    return Array.from({ length: daysInMonth }, (_, index) => {
      const date = new Date(year, month, index + 1, 12, 0, 0);
      const isoDate = toIsoDate(date);

      return {
        date: isoDate,
        dayName: dayFormatter.format(date),
        dayNumber: String(index + 1),
        hours: totals.get(isoDate) ?? 0,
        isWeekend: !isWeekday(date)
      };
    });
  }

  private aggregateByDate(): Map<string, number> {
    const totals = new Map<string, number>();

    for (const activity of this.repository.activities()) {
      totals.set(activity.date, (totals.get(activity.date) ?? 0) + activity.hours);
    }

    return totals;
  }
}
