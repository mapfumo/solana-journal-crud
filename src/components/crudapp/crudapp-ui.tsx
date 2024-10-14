"use client";

import { Keypair, PublicKey } from "@solana/web3.js";
import { ellipsify } from "../ui/ui-layout";
import { ExplorerLink } from "../cluster/cluster-ui";
import {
  useCrudappProgram,
  useCrudappProgramAccount,
} from "./crudapp-data-access";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

export function CrudappCreate() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const { createEntry } = useCrudappProgram();
  const { publicKey } = useWallet(); // from walletAdapter library

  const isFormValid = title.trim() != "" && message.trim() != "";

  const handleSubmit = () => {
    if (publicKey && isFormValid) {
      createEntry.mutateAsync({
        title,
        message,
        owner: publicKey,
      });
    }
  };

  if (!publicKey) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Connect your wallet to create a journal entry.</span>
      </div>
    );
  }

  return (
    <div>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="input input-bordered w-full max-w-xs"
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="textarea textarea-bordered w-full max-w-xs"
      />
      <button
        className="btn btn-xs lg:btn-md btn-primary"
        onClick={handleSubmit}
        disabled={!isFormValid || createEntry.isPending}
      >
        Create {createEntry.isPending && "..."}
      </button>
    </div>
  );
}

export function CrudappList() {
  const { accounts, getProgramAccount } = useCrudappProgram();

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>
          Program account not found. Make sure you have deployed the program and
          are on the correct cluster.
        </span>
      </div>
    );
  }
  return (
    <div className={"space-y-6"}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <CrudappCard
              key={account.publicKey.toString()}
              account={account.publicKey}
            />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={"text-2xl"}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  );
}

function CrudappCard({ account }: { account: PublicKey }) {
  const { accountQuery, updateEntry, deleteEntry } = useCrudappProgramAccount({
    account,
  });
  const { createEntry } = useCrudappProgram();

  const { publicKey } = useWallet();
  const [message, setMessage] = useState("");
  const title = accountQuery.data?.title;

  const isFormValid = message.trim() != "";

  const handleSubmit = () => {
    if (publicKey && isFormValid) {
      createEntry.mutateAsync({
        title,
        message,
        owner: publicKey,
      });
    }
  };

  if (!publicKey) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Connect your wallet to create a journal entry.</span>
      </div>
    );
  }

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <div className="card card-bordered border-base-300 border-4 text-neutral-content">
      <div className="card-body items-center text-center">
        <div className="space-y-4"></div>
        <h2
          className="card-title justify-center text-3xl cursor-pointer"
          onClick={() => accountQuery.refetch()}
        >
          {accountQuery.data?.title}
        </h2>
        <p>{accountQuery.data?.message}</p>
        <div className="card-actions">
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || updateEntry.isPending}
            className="btn btn-xs btn-primary"
          >
            Update
          </button>
          <button
            onClick={() => deleteEntry.mutate(title)}
            disabled={deleteEntry.isPending}
            className="btn btn-xs btn-error"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
