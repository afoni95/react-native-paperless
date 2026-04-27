type ApiStatusStorage = {
  total: number;
  available: number;
};

type ApiStatusDatabaseMigrationStatus = {
  latest_migration: string;
  unapplied_migrations: unknown[];
};

type ApiStatusDatabase = {
  type: string;
  url: string;
  status: string;
  error: string;
  migration_status: ApiStatusDatabaseMigrationStatus;
};

type ApiStatusTasks = {
  redis_url: string;
  redis_status: string;
  redis_error: string;
  celery_url: string;
  celery_error: string;
  index_status: string;
  index_last_modified: string;
  index_error: string;
  classifier_status: string;
  classifier_last_trained: string;
  classifier_error: string;
  sanity_check_status: string;
  sanity_check_last_run: string;
  sanity_check_error: string;
};

export type ApiStatus = {
  pngx_version: string;
  server_os: string;
  install_type: string;
  storage: ApiStatusStorage;
  database: ApiStatusDatabase;
  tasks: ApiStatusTasks;
};
