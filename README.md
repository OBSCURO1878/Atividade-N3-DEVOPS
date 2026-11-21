# Projeto Loja — Containerização e Orquestração com Kubernetes (N3)

Aplicação RESTful em Node.js integrada a **MySQL 8.0** (persistência) e **Redis 7** (cache), empacotada com Docker, orquestrada localmente via Docker Compose e implantada em cluster Kubernetes no namespace `n3-angelo`.

## Estrutura do Projeto
- `app/`: Código-fonte da API, `Dockerfile` (base Alpine e usuário não-root) e `.dockerignore`.
- `k8s/`: Manifestos Kubernetes (`Namespace`, `ConfigMap`, `Secret`, `PersistentVolumeClaim`, `Deployments`, `Services`).
- `docker-compose.yml`: Orquestração local com healthchecks e volume persistente.
- `.env.example`: Modelo de variáveis de ambiente.
- `comandos.md`: Histórico dos comandos operacionais executados.

## Como Executar via Docker Compose
1. Copie `.env.example` para `.env` e ajuste as credenciais se necessário.
2. Suba o ambiente:
   ```bash
   docker compose up -d
   ```
3. Acesse a API em `http://localhost:3000/produtos` ou `http://localhost:3000/health`.

## Como Executar no Kubernetes
1. Construa a imagem localmente:
   ```bash
   docker build -t api-loja:1.0 ./app
   ```
2. Aplique os manifestos:
   ```bash
   kubectl apply -f k8s/
   ```
3. Verifique os recursos no namespace `n3-angelo`:
   ```bash
   kubectl get all -n n3-angelo
   ```
4. Exponha o serviço localmente (se necessário no Docker Desktop):
   ```bash
   kubectl port-forward service/api-service 30080:3000 -n n3-angelo
   ```
