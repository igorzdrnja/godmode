## GodMode Wallet Classifier

### A small ERC-20 Token classifying app for wallets.

#### The app exposes single restful GET endpoint:
```
/wallet
```
Query parameters:
- address (wallet address)

Example request:
```
/wallet?address=0xA69babEF1cA67A37Ffaf7a485DfFF3382056e78C
```

Proper request to this endpoint with the wallet address retrieves all the ERC=20 token balances in the wallet and checks if there is more than predefined threshold amount of tokens in it.
If there is, wallet's classification for that token is 'GodLike'. If there are no tokens present in the wallet, null is returned as balance for the token.

Token symbols to check the wallet for GodLike classifications are stored in the local tokens.csv file in the src folder,
for convenient updating of the desired tokens to be checked for, including thresholds. Sample file with more than 2000 tokens is included in this repository.
If threshold for the particular token is not present in the file, it will be randomly selected between 0 and MAX_RANDOM_THRESHOLD_USED number from the .env environment variables file.
On every request, token data will be first read from tokens csv file, which means the csv file data can be modified without the app being restarted.

You will need a custom Alchemy provider API key for the app, check out https://dashboard.alchemy.com/. The key should be stored in the PROVIDER_KEY environment var in .env file.




## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

###ToDos:

- Jest tests
- Support for different networks than mainnet
- Dockerization