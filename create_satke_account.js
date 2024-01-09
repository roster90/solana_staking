const { web3 } = require("@project-serum/anchor");
const { Connection, clusterApiUrl, Keypair, LAMPORTS_PER_SOL, StakeProgram, Authorized, Lockup, sendAndConfirmTransaction } = require("@solana/web3.js");

const main = async ()=>{

    const connection = new Connection(clusterApiUrl('devnet'), 'processed');
    const wallet = Keypair.generate();
    const airdropSignature = await connection.requestAirdrop(wallet.publicKey, 2 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(airdropSignature);
    const balance = await connection.getBalance(wallet.publicKey)
    console.log("balance");

    const stakeAccount = Keypair.generate();

    const minimumRent = await connection.getMinimumBalanceForRentExemption(StakeProgram.space);
    const amountUserWant2Stake = 0.5 * LAMPORTS_PER_SOL;
    const amount2Stake = minimumRent + amountUserWant2Stake;

    const createStakeAccountTx = StakeProgram.createAccount({
        authorized: new Authorized(wallet.publicKey, wallet.publicKey),
        fromPubkey: wallet.publicKey,
        lamports: amount2Stake,
        lockup: new Lockup(0, 0, wallet.publicKey),
        stakePubkey: stakeAccount.publicKey
    })
    const createAccountTxId = await sendAndConfirmTransaction(connection, createStakeAccountTx, [wallet, stakeAccount]);

    console.log(`Stake account created. TX id: ${createAccountTxId}` );

    const stakeBalance  = await connection.getBalance(stakeAccount.publicKey)

    console.log(`Balance of stake account: ${stakeBalance / LAMPORTS_PER_SOL}` );

    const stakeStatus = await connection.getStakeActivation(stakeAccount.publicKey);

    console.log(`stakeStatus: ${stakeStatus.state}` );
  
}

const runMain = async()=>{
    try {
       await main()
    } catch (error) {
        console.log(error);
    }
}

runMain()