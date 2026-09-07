-- AgroVoice schema for Oracle 11g
-- Run as your application user in SQL*Plus or SQL Developer.

-- Drop if re-running (ignore errors on first run)
BEGIN EXECUTE IMMEDIATE 'DROP TABLE shipments';        EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE farmers';          EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE farmers_seq';   EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE shipments_seq'; EXCEPTION WHEN OTHERS THEN NULL; END;
/

CREATE TABLE farmers (
  id       NUMBER PRIMARY KEY,
  name     VARCHAR2(120) NOT NULL,
  phone    VARCHAR2(20),
  village  VARCHAR2(120),
  created_at DATE DEFAULT SYSDATE
);

CREATE SEQUENCE farmers_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE TRIGGER farmers_bi
BEFORE INSERT ON farmers FOR EACH ROW
BEGIN
  IF :NEW.id IS NULL THEN
    SELECT farmers_seq.NEXTVAL INTO :NEW.id FROM dual;
  END IF;
END;
/

CREATE TABLE shipments (
  id           NUMBER PRIMARY KEY,
  farmer_id    NUMBER REFERENCES farmers(id),
  produce      VARCHAR2(120),
  quantity_kg  NUMBER,
  pickup       VARCHAR2(200),
  dropoff      VARCHAR2(200),
  pickup_date  DATE,
  status       VARCHAR2(20) DEFAULT 'PENDING',
  created_at   DATE DEFAULT SYSDATE
);

CREATE SEQUENCE shipments_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE TRIGGER shipments_bi
BEFORE INSERT ON shipments FOR EACH ROW
BEGIN
  IF :NEW.id IS NULL THEN
    SELECT shipments_seq.NEXTVAL INTO :NEW.id FROM dual;
  END IF;
END;
/

COMMIT;
