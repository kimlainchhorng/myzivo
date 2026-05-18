
-- Fix mutable search_path on public functions

CREATE OR REPLACE FUNCTION public.broadcast_table_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_schema text := TG_TABLE_SCHEMA;
  v_table  text := TG_TABLE_NAME;
  v_id     text;
  v_topic_row text;
  v_topic_all text := 'table:' || v_schema || '.' || v_table || ':all';
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_id := COALESCE(OLD.id::text, OLD.uuid::text, OLD.pk::text);
  ELSE
    v_id := COALESCE(NEW.id::text, NEW.uuid::text, NEW.pk::text);
  END IF;

  v_topic_row := 'table:' || v_schema || '.' || v_table || ':' || COALESCE(v_id, 'all');

  PERFORM realtime.broadcast_changes(
    v_topic_row, TG_OP, TG_OP, TG_TABLE_NAME, TG_TABLE_SCHEMA, NEW, OLD
  );

  PERFORM realtime.broadcast_changes(
    v_topic_all, TG_OP, TG_OP, TG_TABLE_NAME, TG_TABLE_SCHEMA, NEW, OLD
  );

  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.build_realtime_topic(_schema text, _table text, _id text)
 RETURNS text
 LANGUAGE sql
 STABLE
 SET search_path = public
AS $function$
  SELECT 'table:' || _schema || '.' || _table || ':' || _id;
$function$;

CREATE OR REPLACE FUNCTION public.messages_broadcast_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  PERFORM realtime.broadcast_changes(
    'table:public.messages:all',
    TG_OP,
    TG_OP,
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    NEW,
    OLD
  );

  PERFORM realtime.broadcast_changes(
    'table:public.messages:' || COALESCE(NEW.id::text, OLD.id::text),
    TG_OP,
    TG_OP,
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    NEW,
    OLD
  );

  RETURN COALESCE(NEW, OLD);
END;
$function$;
;
