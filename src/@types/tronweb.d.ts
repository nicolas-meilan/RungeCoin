import { BigNumber } from 'ethers';

declare module 'tronweb' {
  import {
    Account,
    AccountMnemonic,
    AssetTRC10,
    AssetUpdate,
    BlockInfo,
    BlockInput,
    BlockTransaction,
    BytesLike,
    ChainParameter,
    ContractExecutionParams,
    CreateRandomOptions,
    DelegatedResourceAccount,
    DelegatedResourceList,
    EnergyEstimate,
    EventResult,
    Exchange,
    Header,
    HexString,
    JsonFragment,
    KeyValue,
    Miner,
    NodeInfo,
    Proposal,
    Resource,
    SideOptions,
    TokenInfo,
    Transaction,
    TransactionResult,
    TriggerConstantContractResult,
    TronAccountResource,
    TronContract,
    TronContractResult,
    TronWebConstructor,
    TrxAccount,
  } from './tronweb.interface';

  export class TronWeb {
    address: any;

    transactionBuilder: any;

    trx: any;

    utils: any;
    constructor(fullNode: string, solidityNode: string, eventServer: string | boolean, privateKey?: string | boolean);
    constructor(fullNode: string, solidityNode: string, eventServer: string | boolean, sideOptions: SideOptions, privateKey?: string | boolean);
    constructor(obj: TronWebConstructor);
    contract(data: JsonFragment[], address: string): TronContract;
    setHeader(header: Header): void | Error;
    currentProvider(): any;
    currentProviders(): any;
    getEventByTransactionID(transactionID: string): Promise<Transaction | any>;
    getEventResult(contractAddress: string, options?: object): Promise<EventResult[] | any>; // check this return
    isConnected(): object;
    isValidProvider(provider: any): any;
    setAddress(address: string): void | Error;
    setDefaultBlock(blockID?: BlockInput): void | string | boolean;
    setEventServer(eventServer: any): void | Error;
    setFullNode(fullNode: any): void | Error;
    setPrivateKey(privateKey: string): void | Error;
    setSolidityNode(solidityNode: any): void | Error;
    createAccount(): Promise<Account | any>;
    createRandom(options?: CreateRandomOptions): Promise<AccountMnemonic | any>;
    fromAscii(string: any, padding: any): any;
    fromDecimal(value: number | string): string;
    fromSun(sun: string | number): string;
    fromUtf8(string: string): string;
    fromMnemonic(mnemonic: string, path?: string, wordlist?: string): AccountMnemonic | Error;
    isAddress(address: string): boolean;
    sha3(string: string, prefix?: boolean): HexString;
    toAscii(hex: HexString): string;
    toBigNumber(amount: number | string | HexString): BigNumber | object;
    toDecimal(value: string | HexString): number | string;
    toHex(val: string | number | object | [] | BigNumber): HexString;
    toSun(trx: number): string;
    toUtf8(hex: string): string;
    BigNumber(val: number | string | HexString): BigNumber;
  }

  export namespace TronWeb {
    export namespace transactionBuilder {
      function addUpdateData(unsignedTransaction: JSON | object, memo: string): Promise<Transaction | object>;
      function applyForSR(address: string, url: string, options?: number): Promise<Transaction | object>;
      function createAccount(address: string, options?: JSON | object): Promise<Transaction | object>;
      function createAsset(options: AssetTRC10, issuerAddress: string): Promise<Transaction | object>;
      function createProposal(parameters: KeyValue[], issuerAddress: string, options?: number): Promise<Transaction | object>;
      function createSmartContract(options: ContractExecutionParams, issuerAddress: string): Promise<Transaction | object>;
      function createToken(options: AssetTRC10, issuerAddress: string): Promise<Transaction | object>;
      function delegateResource(amount: number, receiverAddress: string, resource: string, address: string, lock: boolean, options?: object): Promise<object>;
      function deleteProposal(proposalID: number, issuerAddress: string, options?: number): Promise<Transaction | object>;
      function estimateEnergy(contractAddress: string | HexString, functionSelector: string, options: object, parameter: any[], issuerAddress: string | HexString): Promise<EnergyEstimate>;
      function extendExpiration(transaction: Transaction | JSON | object, extension: number): Promise<Transaction>;
      function freezeBalance(amount: number, duration: number, resource: Resource, ownerAddress: string, receiverAddress: string, options?: number): Promise<Transaction>;
      function freezeBalanceV2(amount: number, resource: Resource, ownerAddress: string, options?: object): Promise<Transaction | object>;
      function injectExchangeTokens(exchangeID: number, tokenID: string, tokenAmount: number, ownerAddress: string, options?: number): Promise<Transaction>;
      function purchaseAsset(issuerAddress: string, tokenID: string, amount: number, buyer?: string, options?: number): Promise<Transaction | object>;
      function purchaseToken(issuerAddress: string, tokenID: string, amount: number, buyer?: string, options?: number): Promise<Transaction | object>;
      function sendAsset(to: string, amount: number, tokenID: string, from: string, options: number): Promise<Transaction | object>;
      function sendToken(to: string, amount: number | string, tokenID: string, pk?: string): Promise<Transaction | object>;
      function sendTrx(to: string, amount: number, from: string, options: number): Promise<Transaction | object>;
      function tradeExchangeTokens(exchangeID: number, tokenID: string, tokenAmountSold: number, tokenAmountExpected: number, ownerAddress: string, options: number): Promise<Transaction | object>;
      function triggerConfirmedConstantContract(contractAddress: string, functions: string, options: object, parameter: any[], issuerAddress: string): Promise<TransactionResult | object>;
      function triggerConstantContract(contractAddress: string, functions: string, options: object, parameter: any[], issuerAddress: string): Promise<TriggerConstantContractResult | object>;
      function triggerSmartContract(contractAddress: string, functions: string, options: object, parameter: any[], issuerAddress: string): Promise<TriggerConstantContractResult | object>;
      function undelegateResource(amount: number, receiverAddress: string, resource: string, address: string, options?: object): Promise<object>;
      function unfreezeBalance(resource: Resource, address: string, receiver: string, options: number): Promise<Transaction | object>;
      function unfreezeBalanceV2(amount: number, resource: Resource, address: string, options: object): Promise<object>;
      function updateSetting(contract_address: string, consume_user_resource_percent: number, owner_address: string, options: number): Promise<Transaction | object>;
      function updateAccountPermissions(owner_address: string, ownerPermissions: object, witnessPermissions: object | null, activesPermissions: object[]): Promise<Transaction | object>;
      function updateAsset(options: AssetUpdate, issuerAddress: string): Promise<Transaction | object>;
      function updateBrokerage(brokerage: number, ownerAddress: string): Promise<Transaction | object>;
      function updateEnergyLimit(contract_address: string, origin_energy_limit: number, owner_address: string, options: number): Promise<Transaction | object>;
      function updateToken(options: AssetUpdate, issuerAddress: string): Promise<Transaction | object>;
      function vote(votes: object, voterAddress: string, option: number): Promise<Transaction | object>;
      function voteProposal(proposalID: number, hasApproval: string, voterAddress: string, options: number): Promise<Transaction | object>;
      function withdrawBlockRewards(address: string, options: number): Promise<Transaction | object>;
      function withdrawExchangeTokens(exchangeID: number, tokenID: string, tokenAmount: number, ownerAddress: string, options: number): Promise<Transaction | object>;
      function withdrawExpireUnfreeze(address: string): Promise<object>;
    }
    export namespace trx {
      function getAccount(address: HexString | string): Promise<TrxAccount>;
      function getAccountResources(address: HexString | string): Promise<TronAccountResource>;
      function getApprovedList(r: Transaction): Promise<TransactionResult>;
      function getAvailableUnfreezeCount(address: string | HexString, options?: object): Promise<object>;
      function getBalance(address: string | HexString): Promise<number>;
      function getBandwidth(address: string | HexString): Promise<object>;
      function getBlock(block?: number | string): Promise<BlockInfo>;
      function getBlockByHash(blockHash: string): Promise<BlockInfo>;
      function getBlockByNumber(blockID: number): Promise<BlockInfo>;
      function getBlockRange(start: number, end: number): Promise<BlockInfo[]>;
      function getBlockTransactionCount(block: number | string): Promise<object | number>;
      function getBrokerage(address: string | HexString): Promise<number | any>;
      function getCanDelegatedMaxSize(address: string | HexString, resource?: Resource, options?: object): Promise<object>;
      function getCanWithdrawUnfreezeAmount(address: string | HexString, timestamp?: number, options?: object): Promise<object>;
      function getChainParameters(): Promise<ChainParameter[] | any>;
      function getConfirmedTransaction(transactionID: string): Promise<object>;
      function getContract(contractAddress: string | HexString): Promise<TronContractResult | TronContract | object>;
      function getCurrentBlock(): Promise<BlockInfo>;
      function getDelegatedResourceV2(fromAddress: string | HexString, toAddress: string | HexString, options?: object): Promise<DelegatedResourceList | object>;
      function getDelegatedResourceAccountIndexV2(address: string | HexString, options?: object): Promise<DelegatedResourceAccount | object>;
      function getExchangeByID(exchangeID: number): Promise<Exchange | object>;
      function getNodeInfo(): Promise<NodeInfo | object>;
      function getReward(address: string | HexString): Promise<number>;
      function getSignWeight(tx: Transaction): Promise<TransactionResult | object>;
      function getTokenByID(tknID: string | number): Promise<TokenInfo | object>;
      function getTokenFromID(tokenID: string | number): Promise<TokenInfo>;
      function getTokenListByName(name: string): Promise<TokenInfo[] | object[]>;
      function getTokensIssuedByAddress(address: string | HexString): Promise<object>;
      function getTransaction(transactionID: string): Promise<BlockTransaction | object>;
      function getTransactionFromBlock(block: number | string, index: number): Promise<BlockTransaction[] | object[] | BlockTransaction | object>;
      function getTransactionInfo(transactionID: string): Promise<Transaction | object>;
      function getUnconfirmedBalance(address: string): Promise<number>;
      function getUnconfirmedBrokerage(address: string): Promise<number>;
      function getUnconfirmedReward(address: string): Promise<number>;
      function getUnconfirmedTransactionInfo(txid: string): Promise<Transaction | object>;
      function listExchanges(): Promise<Exchange[] | object[]>;
      function listExchangesPaginated(limit: number, offset: number): Promise<Exchange[] | object[]>;
      function listNodes(): Promise<string[] | object>;
      function listProposals(): Promise<Proposal[] | object[] | object>;
      function listSuperRepresentatives(): Promise<Miner[] | object[]>;
      function listTokens(limit?: number, offset?: number): Promise<TokenInfo[] | object[]>;
      function sendRawTransaction(signedTransaction: JSON | object, options?: any): Promise<TransactionResult | object>;
      function sendHexTransaction(signedHexTransaction: string | HexString): Promise<Transaction | object>;
      function sendToken(to: string, amount: number, tokenID: string, from: string, options: number): Promise<TransactionResult | object>;
      function sendTransaction(to: string, amount: number, pk?: string): Promise<TransactionResult | object>;
      function sign(transaction: object, privateKey: string): Promise<Transaction | object>;
      function sign(str: string, privateKey: string): Promise<string>;
      function signMessageV2(msg: string | BytesLike, privateKey: string): Promise<string>;
      function timeUntilNextVoteCycle(): Promise<number>;
      function multiSign(tx: JSON | object, pk: string, permissionId: number): Promise<Transaction | object>;
      function verifyMessage(message: string | HexString, signature: string, address: string): Promise<boolean>;
      function verifyMessageV2(message: string | HexString, signature: string): Promise<string>;
      // eslint-disable-next-line @typescript-eslint/naming-convention
      function _signTypedData(domain: JSON | object, types: JSON | object, value: JSON | object, privateKey: string): Promise<string>;
      function verifyTypedData(domain: JSON | object, types: JSON | object, value: JSON | object, signature: string, address: string): Promise<boolean | Error>;
    }
    export namespace address {
      function fromHex(hex: string): string;
      function fromPrivateKey(pk: string): string;
      function toHex(base58: string): string;
    }
    export namespace utils {
      export namespace transaction {
        function txJsonToPb(tx: JSON | object): object;
        function txPbToTxID(tx: JSON | object): string;
      }
    }
  }

  export default TronWeb;
}