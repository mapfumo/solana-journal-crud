#![allow(clippy::result_large_err)]
// This allows large errors in the Result type without triggering a Clippy lint warning.
// Clippy is a Rust tool to catch common mistakes and improve code quality.

use anchor_lang::prelude::*;

declare_id!("pBURaAzkaUyxRYukW33vhV2eGJpuo6RnCuDM3XcHgoA");

#[program]
// `#[program]` macro declares this as the main entry point for your smart contract.
pub mod crudapp {
    use super::*;

    pub fn create_journal_entry(
        ctx: Context<CreatelEntry>,
        title: String,
        message: String,
    ) -> Result<()> {
        // This is the function that handles creating a new journal entry.
        // It takes the execution context (`ctx`), a `title` string, and a `message` string as input,
        // and returns a `Result` type, where an empty `Ok(())` indicates success.
        let journal_entry = &mut ctx.accounts.journal_entry;
        journal_entry.owner = *ctx.accounts.owner.key;
        journal_entry.title = title;
        journal_entry.message = message;

        Ok(())
        // Return success. The `Ok(())` result type indicates that the function executed successfully.
    }

    pub fn update_journal_entry(
        ctx: Context<UpdatelEntry>,
        _title: String,
        message: String,
    ) -> Result<()> {
        let journal_entry = &mut ctx.accounts.journal_entry;
        journal_entry.message = message;
        Ok(())
    }

    pub fn delete_journal_entry(_ctx: Context<UpdatelEntry>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
// This macro defines the accounts structure required for the `create_journal_entry` function.
// It ensures that the right accounts are passed when the transaction is sent.
#[instruction(title: String)] // passing the info into the instruction
pub struct CreatelEntry<'info> {
    #[account(
    init,
    seeds = [title.as_bytes(), owner.key().as_ref()],
    // Seeds are used to derive a Program Derived Address (PDA). 
    // In this case, the seed includes the `title` and `owner` public key, 
    // making sure the combination of these values is unique for each journal entry.
    bump, // A bump is required to ensure the uniqueness of the PDA and avoid collisions.
    space = 8 + JournalEntryState::INIT_SPACE,
    // The space allocated for the new account. `8` bytes are for account overhead, 
    // and `JournalEntryState::INIT_SPACE` is the size of the journal entry data structure.
    payer = owner,
  )]
    // name the account
    pub journal_entry: Account<'info, JournalEntryState>,

    // need to define who the owner is
    #[account(mut)]
    // The `owner` is a signer, meaning they must sign the transaction.
    // The `mut` keyword means the `owner` account can be modified (such as deducting rent fees for account creation).
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
    // The Solana system program is required for account initialization.
    // It provides system-level operations like account creation and token transfers.
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct UpdatelEntry<'info> {
    #[account(
    mut,
    seeds = [title.as_bytes(), owner.key().as_ref()],
    bump,
    realloc = 8 + JournalEntryState::INIT_SPACE,
    realloc::payer = owner,
    realloc::zero = true,
    )]
    pub journal_entry: Account<'info, JournalEntryState>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
#[instruction(title: String)]
pub struct DeletelEntry<'info> {
    #[account(
    mut,
    seeds = [title.as_bytes(), owner.key().as_ref()],
    bump,
    close = owner,
    )]
    pub journal_entry: Account<'info, JournalEntryState>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}


#[account]
// `InitSpace` is a macro used to calculate and allocate space for this data structure on the blockchain.
#[derive(InitSpace)]
pub struct JournalEntryState {
    pub owner: Pubkey,
    // The public key of the account owner (the user who created this journal entry).
    // `Pubkey` is a built-in Solana data type representing a public key (address).
    // String space is difficlut to calculate in advance. Will set max length of 50 & 1000 instead
    #[max_len(50)]
    pub title: String,
    #[max_len(1000)]
    pub message: String,
}
