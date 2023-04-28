<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456

[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">Configurando AuthGuard com escopos de usuários em aplicações com <a href="https://nestjs.com/">NestJS</a> </p>
    <p align="center">

## Sumário

- [Introdução](#introdução)
    - [Explicação](#explicação)
    - [Definindo escopos dos usuários](#definindo-escopos-dos-usuários)
    - [Como configurar a autorização?](#como-configurar-a-autorização)
    - [Sobre a implementação](#sobre-a-implementação)
    - [Configuração de autorização com guards](#configuração-de-autorização-com-guards)
- [Executando o projeto localmente](#executando-o-projeto-localmente)
    - [Clone do projeto](#clone-do-projeto)
    - [Definição das variáveis de ambiente](#definição-das-variáveis-de-ambiente)
    - [Instalação das dependências](#instalação-das-dependências)
    - [Execução da aplicação](#execução-da-aplicação)
    - [Execução dos testes](#execução-dos-testes)
    - [Consumindo a API com o Postman](#consumindo-a-api-com-o-postman)
- [Contato](#contato)

## Introdução

### Explicação

Esse projeto serve para ilustrar como utilizar a configuração de AuthGuard para cenários de escopo de usuários.

O escopo de usuários, nesse contexto, refere-se às permissões que um usuário tem para acessar determinado recurso.
As permissões para as operações CRUD podem ser classificadas em:

| Sigla      | Descrição                                                               |
|:-----------|:------------------------------------------------------------------------|
| -          | Nenhuma permissão necessária                                            |
| x          | Não possui permissão                                                    |
| create     | Permissão de criação de um recurso                                      |
| create_own | Permissão de criação de um recurso que perterncerá ao requerinte        |
| read       | Permissão de de leitura de um ou mais recursos                          |
| read_own   | Permissão de leitura de um ou mais recursos que pertençam ao requerinte |
| update     | Permissão de atualização de um recurso                                  |
| update_own | Permissão de atualização de um recurso que pertença ao requerinte       |
| delete     | Permissão de deleção de um recurso                                      |
| delete_own | Permissão de deleção de um recurso que pertença ao requerinte           |

Nesse projeto, foi desenvolvida uma API bem simples, sem conexão com banco de dados, apenas simulando como seria o
gerenciamento de permissões para consumir os endpoints com base nas permissões do usuário. Os endpoints são:

| método   | endpoint           |
|:---------|:-------------------|
| `POST`   | `/auth`            |
| `POST`   | `/users`           |
| `GET`    | `/users`           |
| `GET`    | `/users/{user_id}` |
| `PUT`    | `/users/{user_id}` |
| `DELETE` | `/users/{user_id}` |

As premissas de funcionamento da API são:

- As requisições `POST /auth` e `POST /users` são públicas, ou seja, não precisam de token
- A requisição `GET /users` só é permitida para usuário do tipo `admin`, ou seja, usuário do tipo `user` não pode
  acessar
- As requisições `(GET|PUT|DELETE) /users/{user_id}` são permitidas para usuários do tipo `admin` e para usuários do
  tipo `user`, porém usuários do tipo `user` só podem acessá-las se o acesso for de suas próprias informações.

Logo, as definições de endpoints e permissões são:

| path    | método   | endpoint           |    user    | admin  |
|:--------|:---------|:-------------------|:----------:|:------:|
| `auth`  | `POST`   | `/auth`            |     -      |   -    |
| `users` | `POST`   | `/users`           |     -      |   -    |
| `users` | `GET`    | `/users`           |     x      |  read  |
| `users` | `GET`    | `/users/{user_id}` |  read_own  |  read  |
| `users` | `PUT`    | `/users/{user_id}` | update_own | update |
| `users` | `DELETE` | `/users/{user_id}` | delete_own | delete |

### Definindo escopos dos usuários

A identificação do requerinte no consumo da API é feita através do `Bearer Token`. Para obedecer as
premissas dos endpoints e as permissões dos usuários, foram definidos os escopos para cada usuário. Considerando que o
único recurso presente na aplicação é `user`, os escopos de cada usuário são:

```json
{
  "admin": [
    "user:read",
    "user:update",
    "user:delete"
  ],
  "user": [
    "user:read_own",
    "user:update_own",
    "user:delete_own"
  ]
}
```

Logo, o payload do token precisa conter duas informações: o tipo do usuário e o escopo do mesmo. Com isso, o
payload do token deve ser:

|  tipo   | payload                                                                                  | 
|:-------:|:-----------------------------------------------------------------------------------------|
| `admin` | `{ "type": "admin",  "scopes": ["user:read", "user:update", "user:delete"] }`            |
| `user`  | `{ "type: "user",  "scopes": ["user:read_own", "user:update_own", "user:delete_own"] }`  |

Na API, para o acesso de recursos próprios do usuário do tipo `user` , a identificação é feita através do `path` do
endpoint e do `sub` do token. Ou seja, o `user_id` do `path` deve ser igual ao `sub` do token.

### Como configurar a autorização?

No NestJS, existe um recurso chamado `Guards`, que permite com que você realize configurações
de [autorização](https://docs.nestjs.com/security/authorization) do usuário. Segundo a documentação do NestJS, os Guards
possuem "a responsabilidade de determinar se uma solicitação será tratada ou não pelo handler do endpoint em tempo de
execução, baseado em condições pré-definidas". (Guards | NestJS, disponível em: https://docs.nestjs.com/guards).

### Sobre a implementação

A implementação da API foi realizada criando dois recursos: `auth` e `user`. O recurso de `auth` serve para simular
a autenticação de usuário, e o recurso `user` serve para simular as requisições de usuários. Os endpoints foram
implementados conforme descrito nas definições citadas anteriormente. Porém:

* O endpoint `POST /auth`, que gera o `Bearer Token`, apenas recebe o tipo de usuário no body, e retorna o payload
  utilizado para gerar o token e o token propriamente dito. O payload é composto por três informações:
    * sub: o id do usuário, que pode ser informado no body ou pode ser gerado automaticamente
    * type: o tipo do usuário, obrigatório
    * scopes: os escopos do usuário, conforme definido anteriormente
* O endpoint `POST /users` não recebe nenhuma informação no body, apenas retorna um campo id e nome gerados
  automaticamente
* O endpoint `GET /users` recebe apenas um campo de query chamado `size`, que informa a quantidade de elementos a serem
  retornados. O size deve ser maior que 0 e menor que 10 e, caso não seja informado, tem o valor default 2. É retornada
  uma lista de objetos do tamanho definido, com id e nomes gerados automaticamente.
* Os endpoints `(GET | PUT) /users/{user_id}` retornam um objeto com o id informado nos parâmetros e um nome gerado
  automaticamente.
* O endpoint `DELETE /users/{user_id}` retorna um campo `deletedId` com o id informado nos parâmetros

### Configuração de autorização com Guards

Para configurar o Guard na API, é necessário:

- Definir os escopos de autorização de cada endpoint
- Implementar o Guard de autorização

Para definir os escopos de autorização dos endpoints, iremos utilizar
um [Decorator](https://docs.nestjs.com/custom-decorators), denominado `@AuthScope()` que recebe `1..n` escopos e os
associam ao endpoint em questão. Já a implementaçã do Guard, denominado `@AuthorizationGuard()` deverá realizar as
seguintes verificações:

* Se o endpoint possui escopos definidos
    * Caso não tenha, significa que a rota é pública, logo nenhuma ação deverá ser feita
* Se a requisição possui token no header
    * Caso não tenha, um erro deverá ser retornado para usuário, informado que o token é necessário
* Se o token é válido
    * Caso o token seja inválido, um erro deverá ser retornado para usuário, informado que o token não é válido
* Se o usuário possui o escopo requerido para acessar o recurso
    * Caso não possua o escopo, um erro deverá ser retornado para o usuário, informando que o mesmo não possui
      autorização para consumir o endpoint
* Se o endpoint possua algum escopo de acesso próprio (`resource:(create|read|update|delete)_own`)
    * Se o usuário for do tipo `admin`, o usuário pode consumir o endpoint
    * Se o usuário for do tipo `user`:
        * Se o recurso não pertencer ao usuário, um erro deverá ser retornado para o usuário, informando que o mesmo não
          possui autorização para consumir um endpoint

Após definir o `@AuthScope()` e o `@AuthorizationGuard()`, basta:

- Adicionar o `@UseGuards(AuthorizationGuard)` logo após a definição do `@Controller()` do recurso que você deseja
  utilizar os `Guards`
- Adicionar o `@AuthScope()` em cada método do controller, logo após a deifinção do método HTTP do
  endpoint (`Get(), Post(), Put(), Patch(), Delete(), etc.`)

Os detalhes da implementação do `@AuthScope()` e do `@AuthorizationGuard()` podem ser verificados nos
arquivos [authorization.decorator.ts](https://github.com/lucasrochagit/permission-check/tree/main/src/common/guard/authorization/authorization.decorator.ts)
e [authorization.guard.ts](https://github.com/lucasrochagit/permission-check/tree/main/src/common/guard/authorization/authorization.guard.ts)
respectivamente. Para ver a utilização desses recursos no `@Controller()` e em seus métodos, acesse o arquivo
do [UserController](https://github.com/lucasrochagit/permission-check/tree/master/src/user/user.controller.ts).

## Executando o projeto localmente

Caso queira executar esse projeto em sua máquina, siga os seguintes passos:

### Clone do projeto

Utilize o comando a seguir para clonar o projeto em sua máquina local utilizando o Git:

```bash
$ git clone git@github.com:lucasrochagit/permission-check.git
```

### Definição das variáveis de ambiente

Faça uma cópia do arquivo `.env.example` chamada `.env`, e defina os valores conforme desejar.

### Instalação das dependências

Utilize o comando a seguir para instalar as dependências do projeto:

```bash
$ npm install
```

### Execução da aplicação

Para executar a aplicação, utilize um dos comandos a seguir:

```bash
# development
$ npm run start
```

```bash
# watch mode
$ npm run start:dev
```

```bash
# production mode
$ npm run start:prod
```

### Execução dos testes

Para executar os testes da aplicação, utilize um dos comandos a seguir:

```bash
# unit tests
$ npm run test
```

```bash
# e2e tests
$ npm run test:e2e
```

```bash
# test coverage
$ npm run test:cov
```

### Consumindo a API com o Postman

Para consumir a API com o Postman, importe a `collection` e do `environment` localizados no diretório`.postman` do
projeto.

## Contato

- Autor: **Lucas Rocha**<br/><br/>
  [![LinkedIn](https://img.shields.io/static/v1?label=linkedin&message=@lucasrochacc&color=0A66C2)](https://www.linkedin.com/in/lucasrochacc/)
  [![Github](https://img.shields.io/static/v1?label=github&message=@lucasrochagit&color=black)](https://github.com/lucasrochagit/)
