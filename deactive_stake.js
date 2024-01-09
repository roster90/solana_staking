const { web3 } = require("@project-serum/anchor");
const { Connection, clusterApiUrl, Keypair, LAMPORTS_PER_SOL, StakeProgram, Authorized, Lockup, sendAndConfirmTransaction, PublicKey } = require("@solana/web3.js");

const main = async ()=>{

    const connection = new Connection(clusterApiUrl('devnet'), 'processed');
    const wallet = Keypair.generate();
    const airdropSignature = await connection.requestAirdrop(wallet.publicKey, 2 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(airdropSignature);
    const balance = await connection.getBalance(wallet.publicKey)
    console.log("balance:", balance);

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

    let stakeStatus = await connection.getStakeActivation(stakeAccount.publicKey);

    console.log(`stakeStatus: ${stakeStatus.state}` );

    const validators = await connection.getVoteAccounts();

    const voteAccount = validators.current[0];

    const selectedValidatorPubkey = new PublicKey(voteAccount.votePubkey)
    const delegateTx = StakeProgram.delegate({
        stakePubkey: stakeAccount.publicKey,
        authorizedPubkey: wallet.publicKey,
        votePubkey: selectedValidatorPubkey,
    })
    const delegateTxId = await sendAndConfirmTransaction(connection, delegateTx, [wallet, stakeAccount]);
    console.log(`stake account delegate to ${selectedValidatorPubkey} tx id ${delegateTxId}`);

    stakeStatus = await connection.getStakeActivation(stakeAccount.publicKey);
    console.log(`stakeStatus: ${stakeStatus.state}` );

    const deactiveTx = StakeProgram.deactivate({
        stakePubkey: stakeAccount.publicKey,
        authorizedPubkey: wallet.publicKey
    })
    const deactiveTxId = await sendAndConfirmTransaction(connection, deactiveTx, [wallet]);
    console.log(`stake account deactive tx id ${deactiveTxId}`);
    stakeStatus = await connection.getStakeActivation(stakeAccount.publicKey);
    console.log(`stakeStatus: ${stakeStatus.state}` )
  
}

const runMain = async()=>{
    try {
       await main()
    } catch (error) {
        console.log(error);
    }
}

runMain()