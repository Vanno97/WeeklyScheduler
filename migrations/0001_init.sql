
CREATE TABLE IF NOT EXISTS "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"color" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "appointments" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"category_id" integer,
	"email" text,
	"notification_sent" boolean DEFAULT false
);

ALTER TABLE "appointments" ADD CONSTRAINT "appointments_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE no action ON UPDATE no action;

-- Insert default categories
INSERT INTO "categories" ("name", "color") VALUES 
  ('Work', '#1976D2'),
  ('Personal', '#4CAF50'),
  ('Health', '#FF9800'),
  ('Social', '#9C27B0')
ON CONFLICT DO NOTHING;
