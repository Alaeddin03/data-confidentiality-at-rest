# Data Confidentiality at Rest

This project is done as an assignment in SE 472 - Software Security course at UPM. 

It is a basic app that encrypts and stores data into a MySQL database. Then, it retrieves the data and decrypts it to present it in plain text.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Docs](#docs)

## Installation

You need to have `Node.js` on your machine to run the code. Then install the packages using:

```
npm install
```
```
yarn install
```
```
pnpm install
```

## Usage

Please note that you need to create a `.env` file before running the code. Refer to `.env.example` found in this repo.

Simply run:
```
npm run dev
```
```
yarn run dev
```
```
pnpm run dev
```

## Docs
Check the docs below for more info.
- [Node.js](https://nodejs.org)

- [TypeScript](https://www.typescriptlang.org)
- [Prisma](https://www.prisma.io/docs/)
- [bcrypt.js](https://www.npmjs.com/package/bcryptjs)
- [Node.js Crypto Module](https://nodejs.org/api/crypto.html)