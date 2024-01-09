const { web3 } = require("@project-serum/anchor");
const { Connection, clusterApiUrl, Keypair, LAMPORTS_PER_SOL, StakeProgram, Authorized, Lockup, sendAndConfirmTransaction, PublicKey } = require("@solana/web3.js");
const solanatoken = require("@solana/spl-token");
const bs58 = require('bs58')

const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);

const main = async ()=>{

    let wallet = await getAccount('./keys/user-account.key')
    if(!wallet){
        wallet = await createAccount('./keys/user-account.key')
    }

    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    // const wallet = Keypair.generate();


    const airdropSignature = await connection.requestAirdrop(wallet.publicKey, 2 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(airdropSignature);
    const balance = await connection.getBalance(wallet.publicKey)
    console.log(`balance of ${wallet.publicKey.toString()}`, balance);

    // const stakeAccount = Keypair.generate();
    let stakeAccount = await getAccount('./keys/stake-account.key');

    if(!stakeAccount){
        stakeAccount =  await createAccount('./keys/stake-account.key')
    }

    const minimumRent = await connection.getMinimumBalanceForRentExemption(StakeProgram.space);
    const amountUserWant2Stake = 0.5 * LAMPORTS_PER_SOL;
    const amount2Stake = minimumRent + amountUserWant2Stake;

    const createStakeAccountTx = StakeProgram.createAccount({
        authorized: new Authorized(wallet.publicKey, wallet.publicKey),
        fromPubkey: wallet.publicKey,
        lamports: amount2Stake,
        lockup: new Lockup(0, 0, wallet.publicKey),
        stakePubkey: stakeAccount.publicKey
    });

    const createAccountTxId = await sendAndConfirmTransaction(connection, createStakeAccountTx, [wallet, stakeAccount]);

    console.log(`Stake account created. TX id: ${createAccountTxId}` );

    const stakeBalance  = await connection.getBalance(stakeAccount.publicKey)

    console.log(`Balance of stake account ${stakeAccount.publicKey.toString()}: ${stakeBalance / LAMPORTS_PER_SOL}` );

    const stakeStatus = await connection.getStakeActivation(stakeAccount.publicKey);

    console.log(`stakeStatus: ${stakeStatus.state}` );
  
}
const getAccount = async (path_file_key)=>{
    try {

        const data =  await readFile(path_file_key,'utf-8');
      
        const buf = bs58.decode(data)

        const wallet = Keypair.fromSecretKey(buf, {skipValidation: true});

        return wallet
    } catch (error) {
        console.log(error);
        return null;
    }
}

const createAccount = async (path_file_key) =>{
    
    const wallet = Keypair.generate();
    const secretKey = bs58.encode(wallet.secretKey);

     await fs.writeFileSync(path_file_key, secretKey);
     return wallet
}



const runMain = async()=>{
    try {
       await main()
    } catch (error) {
        console.log(error);
    }
}

runMain()