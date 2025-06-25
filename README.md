# Backend NestJS - Sistema de Gerenciamento de Produtos

Um sistema CRUD completo para gerenciamento de produtos desenvolvido com NestJS, MongoDB e TypeScript, incluindo upload e processamento de imagens.

## 📋 Sobre o Projeto

Este projeto é uma API RESTful robusta que permite criar, listar, atualizar e remover produtos. Inclui funcionalidades avançadas como:

- **Upload e processamento de imagens obrigatórias** com recorte automático (1:1)
- Paginação, filtros e ordenação avançados
- Validação completa de dados com mensagens em português
- **Sistema multi-loja** com validação de nomes únicos por contexto
- Testes unitários e end-to-end completos
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
git clone https://github.com/lipsig/backend-nest
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

## 🔗 Endpoints Disponíveis

| Método | Endpoint | Descrição | Imagem |
|--------|----------|-----------|---------|
| `POST` | `/produtos` | Criar novo produto | **Obrigatória** |
| `GET` | `/produtos` | Listar produtos (paginado) | - |
| `GET` | `/produtos/:id` | Buscar produto específico | - |
| `PUT` | `/produtos/:id` | Atualizar produto | Opcional |
| `DELETE` | `/produtos/:id` | Remover produto | - |

---

## 📝 POST /produtos - Criar Produto

### Campos Obrigatórios

| Campo | Tipo | Validação | Descrição |
|-------|------|-----------|-----------|
| `name` | string | 3-100 caracteres | Nome do produto |
| `description` | string | 10-500 caracteres | Descrição detalhada |
| `price` | number | Positivo, 2 casas decimais | Preço em reais |
| `category` | string | 2-50 caracteres | Categoria do produto |
| `image` | file | JPG, JPEG, PNG, GIF (máx 5MB) | **Imagem obrigatória** |

### Campos Opcionais

| Campo | Tipo | Padrão | Validação | Descrição |
|-------|------|--------|-----------|-----------|
| `available` | boolean | `true` | - | Produto disponível |
| `preparationTime` | number | `0` | ≥ 0 | Tempo preparo (minutos) |
| `ingredients` | string | - | - | Lista de ingredientes |
| `allergens` | string | - | - | Informações de alérgenos |
| `calories` | number | `0` | ≥ 0 | Calorias do produto |
| `rating` | number | `0` | 0-5, 2 casas decimais | Avaliação média |
| `reviewCount` | number | `0` | ≥ 0 | Número de avaliações |
| `storeId` | string | - | - | ID da loja (se não informado = produto global) |

### Exemplo de Requisição

```bash
curl -X POST http://localhost:3000/produtos \
  -F "name=Pizza Margherita" \
  -F "description=Pizza clássica com molho de tomate, mussarela e manjericão" \
  -F "price=25.90" \
  -F "category=Pizza" \
  -F "available=true" \
  -F "preparationTime=20" \
  -F "ingredients=Molho de tomate, mussarela, manjericão" \
  -F "storeId=loja-001" \
  -F "image=@pizza.jpg"
```

### Resposta de Sucesso

```json
{
  "message": "Produto criado com sucesso",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Pizza Margherita",
    "description": "Pizza clássica com molho de tomate, mussarela e manjericão",
    "slug": "pizza-margherita",
    "price": 25.90,
    "category": "pizza",
    "available": true,
    "preparationTime": 20,
    "ingredients": "Molho de tomate, mussarela, manjericão",
    "storeId": "loja-001",
    "image": "/uploads/1640995200000-123456789.jpg",
    "calories": 0,
    "rating": 0,
    "reviewCount": 0,
    "createdAt": "2023-12-31T23:59:59.000Z",
    "updatedAt": "2023-12-31T23:59:59.000Z"
  }
}
```

---

## 📋 GET /produtos - Listar Produtos

### Parâmetros de Query (Todos Opcionais)

| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| `page` | number | `1` | Página atual |
| `limit` | number | `10` | Itens por página |
| `category` | string | - | Filtrar por categoria |
| `storeId` | string | - | Filtrar por loja específica |
| `available` | boolean | - | Filtrar por disponibilidade |
| `sortBy` | string | `createdAt` | Campo para ordenação (`name`, `price`, `rating`, `createdAt`, `category`) |
| `sortOrder` | string | `desc` | Ordem (`asc`, `desc`) |

### Exemplos de Uso

```bash
# Listar todos os produtos (paginação padrão)
GET /produtos

# Filtrar por categoria e disponibilidade
GET /produtos?category=pizza&available=true&page=1&limit=5

# Produtos de uma loja específica
GET /produtos?storeId=loja-centro&sortBy=price&sortOrder=asc

# Combinar múltiplos filtros
GET /produtos?storeId=loja-shopping&category=bebidas&available=true&page=2&limit=20
```

### Resposta

```json
{
  "produtos": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Pizza Margherita",
      "price": 25.90,
      "category": "pizza",
      "available": true,
      "storeId": "loja-001",
      "image": "/uploads/1640995200000-123456789.jpg"
    }
  ],
  "total": 50,
  "pages": 5
}
```

---

## 🔍 GET /produtos/:id - Buscar Produto

### Parâmetros

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | string | ID único do produto |

### Exemplo

```bash
GET /produtos/507f1f77bcf86cd799439011
```

---

## ✏️ PUT /produtos/:id - Atualizar Produto

### Campos (Todos Opcionais)

Todos os campos são opcionais na atualização. Apenas os campos enviados serão atualizados.

| Campo | Validação | Observação |
|-------|-----------|------------|
| `name` | 3-100 caracteres | Gera novo slug automaticamente |
| `description` | 10-500 caracteres | - |
| `price` | Positivo, 2 casas decimais | - |
| `category` | 2-50 caracteres | - |
| `available` | boolean | - |
| `preparationTime` | ≥ 0 | - |
| `ingredients` | string | - |
| `allergens` | string | - |
| `calories` | ≥ 0 | - |
| `rating` | 0-5, 2 casas decimais | - |
| `reviewCount` | ≥ 0 | - |
| `storeId` | string | - |
| `image` | file (JPG, JPEG, PNG, GIF) | **Substitui imagem anterior** |

### Exemplo

```bash
curl -X PUT http://localhost:3000/produtos/507f1f77bcf86cd799439011 \
  -F "price=29.90" \
  -F "available=false" \
  -F "image=@nova-imagem.jpg"
```

---

## 🗑️ DELETE /produtos/:id - Remover Produto

### Exemplo

```bash
DELETE /produtos/507f1f77bcf86cd799439011
```

### Resposta

```json
{
  "message": "Produto \"Pizza Margherita\" removido com sucesso"
}
```

---

## 🏪 Sistema Multi-Loja

### Regras de Negócio

| Cenário | Regra |
|---------|-------|
| **Produto com `storeId`** | Nome único apenas dentro da mesma loja |
| **Produto sem `storeId`** | Nome único globalmente |
| **Slugs** | Únicos por contexto (loja ou global) |

### Exemplos Práticos

```bash
# ✅ PERMITIDO: Mesmo nome em lojas diferentes
POST /produtos -F "name=Pizza Margherita" -F "storeId=loja-A" -F "image=@img1.jpg"
POST /produtos -F "name=Pizza Margherita" -F "storeId=loja-B" -F "image=@img2.jpg"

# ❌ ERRO: Mesmo nome na mesma loja
POST /produtos -F "name=Pizza Margherita" -F "storeId=loja-A" -F "image=@img3.jpg"
# Retorna: "Já existe um produto com esse nome nesta loja"

# ✅ PERMITIDO: Produto global
POST /produtos -F "name=Produto Especial" -F "image=@img4.jpg"

# ❌ ERRO: Mesmo nome global
POST /produtos -F "name=Produto Especial" -F "image=@img5.jpg"
# Retorna: "Já existe um produto com esse nome"
```

### Filtros por Loja

```bash
# Produtos de uma loja específica
GET /produtos?storeId=loja-centro

# Produtos globais (sem loja)
GET /produtos?storeId=null

# Todos os produtos (globais + todas as lojas)
GET /produtos
```

---

## ⚠️ Mensagens de Erro Comuns

| Erro | Mensagem |
|------|----------|
| Nome duplicado (mesma loja) | "Já existe um produto com esse nome nesta loja" |
| Nome duplicado (global) | "Já existe um produto com esse nome" |
| Imagem obrigatória | "Imagem é obrigatória para criar um produto" |
| Arquivo inválido | "Apenas arquivos de imagem são permitidos" |
| Produto não encontrado | "Produto #ID não encontrado" |
| Validação de campo | Mensagens específicas por campo em português |

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
- **Prevenção de duplicação de nomes por contexto (loja/global)**
- **Mensagens de erro específicas para duplicatas**

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
- **Sistema multi-loja com validação de unicidade**
- **Geração automática de slugs únicos por contexto**

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

## 📝 Exemplos Completos

### Criar Produto em Loja Específica

```bash
curl -X POST http://localhost:3000/produtos \
  -F "name=X-Bacon Duplo" \
  -F "description=Hambúrguer artesanal com dois hamburguers, bacon crocante e queijo cheddar" \
  -F "price=32.90" \
  -F "category=Hambúrguer" \
  -F "available=true" \
  -F "preparationTime=25" \
  -F "ingredients=Pão brioche, 2 hambúrguers 120g, bacon, queijo cheddar, alface, tomate" \
  -F "allergens=Glúten, leite" \
  -F "calories=850" \
  -F "storeId=loja-centro" \
  -F "image=@xbacon.jpg"
```

### Criar Produto Global

```bash
curl -X POST http://localhost:3000/produtos \
  -F "name=Refrigerante Coca-Cola 350ml" \
  -F "description=Refrigerante tradicional gelado" \
  -F "price=4.50" \
  -F "category=Bebidas" \
  -F "available=true" \
  -F "calories=140" \
  -F "image=@coca.jpg"
```

### Atualizar Apenas Preço

```bash
curl -X PUT http://localhost:3000/produtos/507f1f77bcf86cd799439011 \
  -F "price=35.90"
```

### Buscar com Filtros Avançados

```bash
# Hambúrguers disponíveis, ordenados por preço
curl "http://localhost:3000/produtos?category=hambúrguer&available=true&sortBy=price&sortOrder=asc"

# Produtos da loja centro, página 2
curl "http://localhost:3000/produtos?storeId=loja-centro&page=2&limit=15"
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

Desenvolvido por Felipe Lourenzi

---

⭐ Se este projeto te ajudou, deixe uma estrela!