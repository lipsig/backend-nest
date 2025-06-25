# Backend NestJS - Sistema de Gerenciamento de Produtos

Um sistema CRUD completo para gerenciamento de produtos desenvolvido com NestJS, MongoDB e TypeScript, incluindo upload e processamento de imagens.

## 📋 Sobre o Projeto

Este projeto é uma API RESTful robusta que permite criar, listar, atualizar e remover produtos. Inclui funcionalidades avançadas como:

- Upload e processamento de imagens com recorte automático (1:1)
- Paginação, filtros e ordenação
- Validação completa de dados
- Testes unitários e end-to-end
- MongoDB em memória para desenvolvimento
- Tratamento global de erros

## 🛠️ Stack Tecnológica

- **NestJS** - Framework Node.js progressivo
- **TypeScript** - Linguagem de programação
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **Sharp** - Processamento de imagens
- **Jest** - Framework de testes
- **Class Validator** - Validação de dados
- **Multer** - Upload de arquivos

## 📁 Estrutura do Projeto

```
src/
├── app.module.ts           # Módulo principal
├── main.ts                 # Ponto de entrada
├── common/
│   └── filters/           # Filtros globais de exceção
├── produtos/
│   ├── dto/               # Data Transfer Objects
│   ├── schemas/           # Schemas do Mongoose
│   ├── produtos.controller.ts
│   ├── produtos.service.ts
│   └── produtos.module.ts
test/                      # Testes end-to-end
uploads/                   # Diretório de imagens
```

## 🚀 Como Executar

### Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn

### Instalação

```bash
# Clonar o repositório
git clone <url-do-repositorio>
cd backend-nest

# Instalar dependências
npm install
```

### Executar em Modo Desenvolvimento

```bash
# Modo desenvolvimento com hot reload
npm run start:dev

# A aplicação estará disponível em http://localhost:3000
```

### Outros Comandos

```bash
# Executar em produção
npm run start:prod

# Build da aplicação
npm run build

# Executar testes unitários
npm run test

# Executar testes em modo watch
npm run test:watch

# Executar testes end-to-end
npm run test:e2e

# Coverage dos testes
npm run test:cov
```

## 📚 Documentação da API

### Base URL
```
http://localhost:3000
```

### Endpoints

#### 📝 Produtos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/produtos` | Lista todos os produtos (paginado) |
| `GET` | `/produtos/:id` | Busca produto por ID |
| `POST` | `/produtos` | Cria novo produto |
| `PUT` | `/produtos/:id` | Atualiza produto |
| `DELETE` | `/produtos/:id` | Remove produto |

#### GET /produtos

**Parâmetros de Query:**
- `page` (number): Página atual (padrão: 1)
- `limit` (number): Itens por página (padrão: 10)
- `category` (string): Filtrar por categoria
- `available` (boolean): Filtrar por disponibilidade
- `sortBy` (string): Campo para ordenação (name, price, rating, createdAt, category)
- `sortOrder` (string): Ordem (asc, desc)

**Exemplo:**
```bash
GET /produtos?page=1&limit=10&category=pizza&available=true&sortBy=price&sortOrder=asc
```

**Resposta:**
```json
{
  "produtos": [...],
  "total": 50,
  "pages": 5
}
```

#### POST /produtos

**Body (multipart/form-data):**
```json
{
  "name": "Pizza Margherita",
  "description": "Pizza clássica com molho de tomate, mussarela e manjericão",
  "price": 25.90,
  "category": "Pizza",
  "preparationTime": 20,
  "ingredients": "Molho de tomate, mussarela, manjericão",
  "available": true
}
```

**Arquivo:**
- `image` (file): Imagem do produto (opcional)

#### PUT /produtos/:id

**Body (multipart/form-data):**
```json
{
  "name": "Pizza Margherita Premium",
  "price": 29.90
}
```

#### Validações

**Campos Obrigatórios:**
- `name`: 3-100 caracteres
- `description`: 10-500 caracteres  
- `price`: Número positivo
- `category`: 2-50 caracteres

**Imagem:**
- Formatos aceitos: JPG, JPEG, PNG, GIF
- Tamanho máximo: 5MB
- Processamento automático: redimensionamento para 400x400px

## 🧪 Testes

### Executar Testes

```bash
# Testes unitários
npm run test

# Testes em modo watch
npm run test:watch

# Testes end-to-end
npm run test:e2e

# Coverage completo
npm run test:cov
```

### Cobertura de Testes

O projeto inclui:
- ✅ Testes unitários para services e controllers
- ✅ Testes end-to-end para todos os endpoints
- ✅ Testes de validação de dados
- ✅ Testes de upload de imagens
- ✅ Testes de tratamento de erros

## 🛡️ Funcionalidades de Segurança

- Validação rigorosa de entrada de dados
- Sanitização de uploads de arquivos
- Tratamento global de exceções
- Validação de tipos de arquivo
- Limitação de tamanho de arquivo

## 📊 Funcionalidades Implementadas

### ✅ CRUD Completo
- Create, Read, Update, Delete
- Validações completas
- Tratamento de erros

### ✅ Upload de Imagens
- Processamento com Sharp
- Recorte automático (1:1)
- Validação de tipos
- Substituição de imagens

### ✅ Recursos Avançados
- Paginação inteligente
- Filtros por categoria e disponibilidade
- Ordenação customizável
- Busca case-insensitive

### ✅ Qualidade de Código
- TypeScript strict mode
- Arquitetura modular
- Injeção de dependências
- Testes abrangentes
- Documentação completa

## 🔧 Configurações

### Variáveis de Ambiente

O projeto usa MongoDB em memória por padrão. Para usar MongoDB real:

```bash
# .env
MONGODB_URI=mongodb://localhost:27017/produtos
```

### Configurações de Upload

```typescript
// Localização: src/produtos/produtos.controller.ts
{
  fileFilter: // JPG, JPEG, PNG, GIF
  limits: { fileSize: 5MB }
  storage: memoryStorage() // Processamento em memória
}
```

## 📝 Exemplos de Uso

### Criar Produto com Imagem

```bash
curl -X POST http://localhost:3000/produtos \
  -F "name=Pizza Margherita" \
  -F "description=Pizza clássica italiana" \
  -F "price=25.90" \
  -F "category=Pizza" \
  -F "image=@pizza.jpg"
```

### Listar Produtos com Filtros

```bash
curl "http://localhost:3000/produtos?category=pizza&available=true&page=1&limit=5"
```

### Atualizar Produto

```bash
curl -X PUT http://localhost:3000/produtos/123 \
  -F "price=29.90" \
  -F "image=@nova-imagem.jpg"
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

Desenvolvido com ❤️ por [Seu Nome]

---

⭐ Se este projeto te ajudou, deixe uma estrela!