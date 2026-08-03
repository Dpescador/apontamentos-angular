-- Execute quando uma tabela, coluna ou função nova ainda não aparecer na Data API.
NOTIFY pgrst, 'reload schema';
