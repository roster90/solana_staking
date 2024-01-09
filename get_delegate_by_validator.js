const { web3 } = require("@project-serum/anchor");
const { Connection, clusterApiUrl, Keypair, LAMPORTS_PER_SOL, StakeProgram, Authorized, Lockup, sendAndConfirmTransaction, PublicKey } = require("@solana/web3.js");

const main = async ()=>{

    const connection = new Connection(clusterApiUrl('devnet'), 'processed');
    const STAKE_PROGRAM_ID = new PublicKey('Stake11111111111111111111111111111111111111');
    const VOTE_PUB_KEY = 'ECuwzjAEg7kPVBmmW7xa6Wz9xkK5pbN8cTn4SCdp5PPp';

    const accounts = await connection.getParsedProgramAccounts(STAKE_PROGRAM_ID, {
        filters: [
            {
                memcmp: {
                    offset: 124,
                    bytes: VOTE_PUB_KEY
                }
            }
        ]
    })
    console.log(`Total number of delegator found for ${VOTE_PUB_KEY}  is: ${accounts.length}`);
    if(accounts.length){
        console.log(`Delegator: ${JSON.stringify(accounts[0])}`);
    }
  
}

const runMain = async()=>{
    try {
       await main()
    } catch (error) {
        console.log(error);
    }
}

runMain()