# MVP auth ```by Донкарев Андрей (r3mm1k) & Юдин Анатолий (udinsec)```
### Group N3347

---

# Описание

Схема:

React(Front) -> FastAPI(Back) -> PostgreSQL (DB)

[Docker-compose](docker-compose.yml)

### Докеры
[Docker front](/frontend/Dockerfile)

[Docker back](/backend/Dockerfile)

[Docker DB (внутри compose)](docker-compose.yml)

---

# Архитектура

| компонент | технологии |
|:---------|:----------|
| Frontend | React + Vite + TypeScript |
| Backend | FastAPI + SQLAlchemy + Alembic |
| DB | PostgreSQL |
| Hash | Argon2id |
| Container | Docker + Docker-compose |
| Test | Pytest |
| Conf | .env |

---

# .env
```env
APP_ENV=development
PORT=8000
SECRET_KEY=<key>

# БД
POSTGRES_USER=mvp
POSTGRES_PASSWORD=<pass>
POSTGRES_DB=mvp_db
POSTGRES_HOST=db
POSTGRES_PORT=5432
DATABASE_URL=postgresql+psycopg://mvp:mvp_password@db:5432/mvp_db

# Хэширование
HASH_SCHEME=argon2
ARGON2_TIME_COST=3
ARGON2_MEMORY_COST=65536
ARGON2_PARALLELISM=2
```

---

# Сборка и запуск
1. Инициализация
```bash
docker compose down --remove-orphans
docker compose build --no-cache
docker compose up -d
```

2. Проверка запуска
```bash
docker compose ps
```
Должны быть активны

mvp-auth-db-1         ... (healthy)

mvp-auth-backend-1    ... (Up)

mvp-auth-frontend-1   ... (Up)

3. Провекра backend
```bash
curl -s http://localhost:8000/health
```
Ответ -> {"status":"ok"}

4. Проверка Frontend
```bash
open http://localhost:5173/register
```

---

# API

1. Успешная регистрация
```bash
curl -X POST http://localhost:8000/api/register \
  -H 'Content-Type: application/json' \
  -d '{"login":"User1_ok","password":"Qwerty12!"}'
```
Ответ -> {"message":"user создан"}

2. Слабый пароль
```bash
curl -X POST http://localhost:8000/api/register \
  -H 'Content-Type: application/json' \
  -d '{"login":"User1_weak","password":"123"}'
```
Ответ -> {"detail": {"code": "weak_password","message": "Пароль слишком слаб"}}

3. Дублирующий логин
```bash
curl -X POST http://localhost:8000/api/register \
  -H 'Content-Type: application/json' \
  -d '{"login":"User1_ok","password":"Qwerty12!"}'
```
Ответ -> {"detail": {"code": "login_taken","message": "Логин уже занят"}}

---

# Структура БД

Таблица users
| поле | тип | описание |
|:----|:----|:----|
| id | SERIAL(PK) | уникальный id |
| login | TEXT UNIQUE | логин |
| password_hash | TEXT | argon2id хэш пароля |
| created_at | TIMESTAMP | дата |

---

# Тесты

Запуск тестов
```bash
docker compose run --rm backend pytest -q
```
Результат -> ...

1. Успешная регистрация (201 created)
2. Дублирующий пароль (409 conflict)
3. Слабый пароль (422 unprocessable entity)

---

# Безопасность

| требования | реализация |
|:-----|:-----|
| пароль не хранится в открытом виде | + |
| argon2id + соль | + |
| настройки argon2 в .env | + |
| пароль не логируется | + |
| уникальный индекс login | + |
| изоляция в docker | + |

### Nuclei

До проверки было вот так(
```bash
❯ ./nuclei -u http://192.168.80.4:5173/

                     __     _
   ____  __  _______/ /__  (_)
  / __ \/ / / / ___/ / _ \/ /
 / / / / /_/ / /__/ /  __/ /
/_/ /_/\__,_/\___/_/\___/_/   v3.4.10

		projectdiscovery.io

[WRN] Found 1 templates with syntax error (use -validate flag for further examination)
[INF] Current nuclei version: v3.4.10 (latest)
[INF] Current nuclei-templates version: v10.3.1 (latest)
[INF] New templates added in latest release: 119
[INF] Templates loaded for current scan: 8701
[INF] Executing 5 signed templates from projectdiscovery/nuclei-templates
[WRN] Loading 8696 unsigned templates for scan. Use with caution.
[INF] Targets loaded for current scan: 1
[INF] Templates clustered: 1825 (Reduced 1714 Requests)
[INF] Using Interactsh Server: oast.online
[external-service-interaction] [http] [info] http://192.168.80.4:5173/
[external-service-interaction] [http] [info] http://192.168.80.4:5173/
[snmpv3-detect] [javascript] [info] 192.168.80.4:5173 ["Enterprise: unknown"]
[package-json] [http] [info] http://192.168.80.4:5173/package.json
[http-missing-security-headers:strict-transport-security] [http] [info] http://192.168.80.4:5173/
[http-missing-security-headers:permissions-policy] [http] [info] http://192.168.80.4:5173/
[http-missing-security-headers:x-frame-options] [http] [info] http://192.168.80.4:5173/
[http-missing-security-headers:x-content-type-options] [http] [info] http://192.168.80.4:5173/
[http-missing-security-headers:x-permitted-cross-domain-policies] [http] [info] http://192.168.80.4:5173/
[http-missing-security-headers:cross-origin-opener-policy] [http] [info] http://192.168.80.4:5173/
[http-missing-security-headers:cross-origin-resource-policy] [http] [info] http://192.168.80.4:5173/
[http-missing-security-headers:content-security-policy] [http] [info] http://192.168.80.4:5173/
[http-missing-security-headers:referrer-policy] [http] [info] http://192.168.80.4:5173/
[http-missing-security-headers:clear-site-data] [http] [info] http://192.168.80.4:5173/
[http-missing-security-headers:cross-origin-embedder-policy] [http] [info] http://192.168.80.4:5173/
[INF] Scan completed in 1m. 15 matches found.
```
Меняем [vite.config.ts](frontend/vite.config.ts) (Ставим хедеры и запрещаем просмотр [package.json](frontend/package.json)):
```python
function securityHeadersPlugin() {
  return {
    name: "security-headers",
    enforce: "post",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        res.setHeader("X-Frame-Options", "DENY");
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Referrer-Policy", "no-referrer");
        res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
        res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), securityHeadersPlugin()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": {
        target: "http://backend:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: { host: "0.0.0.0", port: 5173 },
});
```

вывод nuclei
```bash
❯ ./nuclei -u http://192.168.80.4:5173/

                     __     _
   ____  __  _______/ /__  (_)
  / __ \/ / / / ___/ / _ \/ /
 / / / / /_/ / /__/ /  __/ /
/_/ /_/\__,_/\___/_/\___/_/   v3.4.10

		projectdiscovery.io

[WRN] Found 1 templates with syntax error (use -validate flag for further examination)
[INF] Current nuclei version: v3.4.10 (latest)
[INF] Current nuclei-templates version: v10.3.1 (latest)
[INF] New templates added in latest release: 119
[INF] Templates loaded for current scan: 8701
[INF] Executing 5 signed templates from projectdiscovery/nuclei-templates
[WRN] Loading 8696 unsigned templates for scan. Use with caution.
[INF] Targets loaded for current scan: 1
[INF] Templates clustered: 1825 (Reduced 1714 Requests)
[INF] Using Interactsh Server: oast.me
[INF] Scan completed in 16.244884241s. No results found.
```
# No results found.
---
# Логирование

* Уровни: ```INFO```, ```ERROR```
* Логируется:
	+ Успешная регистрация
	+ Дублирующий логин
	+ Ошибка валидации
	+ Ошибки ДБ

---

# Полезные команды

| действие | команда |
|:---------|:----------|
| перезапустить без сборки | ```bash docker compose restart``` |
| пересобрать все | ```bash docker compose up -d --build``` |
| посмотреть логи | ```bash docker compose logs -f backend/frontend``` |
| остановить все | ```bash docker compose down``` |
| проверить бд | ```bash docker compose exec db psql -U mvp -d mvp_db -c "SELECT * FROM users;"``` |

---

# Участники

* Донкарев Андрей
	+ Backend
		- all
	+ DB
		- all
* Юдин Анатолий
	+ Frontend
		- all
	+ Tests
		- all
    + Helps with security in backend
