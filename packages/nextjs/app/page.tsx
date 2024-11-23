"use client";

import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { universities } from "./layout";
import { parseUnits } from "viem";
import { useState } from "react";
import { publicKey, encrypt, sum_encrypted, decrypt, privateKey } from "~~/crypto/fhe";

const Home: NextPage = () => {
  const zeroaddress = "0x0000000000000000000000000000000000000000";
  const { address: connectedAddress } = useAccount();
  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract("YourContract");
  const { data: universityAddress, isLoading } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "professorToUniversity",
    args: [connectedAddress],
  });
  const { data: VOTE_STATUS, isLoading: isLoading2 } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "VOTE_STATUS",
  });
  const { data: hasVoted, isLoading: isLoading3 } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "hasVoted",
    args: [connectedAddress],
  });
  const { data: cap, isLoading: isLoading4 } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "CAP",
  });
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
  if (isLoading4 || isLoading3 || isLoading2 || isLoading || !connectedAddress || !universityAddress) return null;
  else {
    const username = connectedAddress in universities ? universities[connectedAddress] : "User";
    const subtitle = universityAddress === zeroaddress ? null : "Member of " + universities[universityAddress];

    


    function NoEnrolledUser() {
      // Function to handle when university is selected
      const handleUniversityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedUniversity(e.target.value);
      };
      return (
        <>
        <div className="w-full max-w-xs mx-auto">
          <label htmlFor="universitySelect" className="block text-lg font-medium text-center">Select University</label>
          <select
            id="universitySelect"
            className="mt-2 p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full"
            onChange={handleUniversityChange}
            value={selectedUniversity || ""}
          >
            <option value="">Select University</option>
            {Object.entries(universities).map(([universityAddress, universityName]) => (
              <option key={universityAddress} value={universityAddress}>
                {universityName}
              </option>
            ))}
          </select>
        </div>
      
        <div className="mt-5 flex justify-center">
          <button
            className="btn btn-primary"
            onClick={async () => {
              if (!selectedUniversity) {
                console.error("No university selected");
                return;
              }
              try {
                await writeYourContractAsync({
                  functionName: "enrollProfessor",
                  args: [selectedUniversity],
                  value: parseUnits('10', 1)
                });
              } catch (e) {
                console.error("Error enrolling professor:", e);
              }
            }}
          >
            Enroll User
          </button>
        </div>
      </>
    );
    }
  

    function EnrolledUser() {
      return (
        <div className="flex justify-center">
          <button
            className="btn btn-primary"
            onClick={async () => {
              try {
                await writeYourContractAsync({
                  functionName: "removeProfessor",
                });
              } catch (e) {
                console.error("Error unenrolling professor:", e);
              }
            }}
          >
            Unenroll User
          </button>
        </div>
      );
    }

    function UniState0() {
      return (
        <div className="flex justify-center">
          <button
            className="btn btn-primary"
            onClick={async () => {
              try {
                await writeYourContractAsync({
                  functionName: "startVotation",
                  value: parseUnits('100', 1)
                });
              } catch (e) {
                console.error("Error voting:", e);
              }
            }}
          >
            Start Votation
          </button>
        </div>
      );
    }

    function UniState1NotVoted() {
      return (
        <>
        <div className="flex justify-center">
          {/* text area which user must inert jsonnable string */}
          <textarea
            className="w-1/2 p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="{ 'scheda bianca': 0 }"
          ></textarea>
        </div>
        <div className="flex justify-center mt-5">
          <button
            className="btn btn-primary"
            onClick={async () => {
              // get the value of the text area
              const vote = document.querySelector("textarea")?.value;
              if (!vote) {
                console.error("No vote inserted");
                return;
              }
              const voteJson = JSON.parse(vote);
              if (typeof voteJson !== "object") {
                console.error("Invalid vote");
                return;
              }
              for (const [key, value] of Object.entries(voteJson)) {
                if (typeof key !== "string" || typeof value !== "number") {
                  console.error("Invalid vote");
                  return;
                }
              }
              for (const [key, value] of Object.entries(voteJson)) {
                if (value as number < 0) {
                  console.error("Invalid vote");
                  return;
                }
              }
              let sum = 0;
              for (const [key, value] of Object.entries(voteJson)) {
                sum += value as number;
              }
              if (cap !== undefined && sum > cap) {
                console.error("Invalid vote");
                return;
              }
              // encrypt each value for each key
              const encryptedVote: { [key: string]: string } = {};
              for (const [key, value] of Object.entries(voteJson)) {
                encryptedVote[key] = (await encrypt(publicKey, BigInt(value as number))).toString();
              }
              try {
                await writeYourContractAsync({
                  functionName: "vote",
                  args: [JSON.stringify(encryptedVote)],
                });
              } catch (e) {
                console.error("Error voting:", e);
              }
            }
          }
          >
            Submit
          </button>
        </div>
        </>
      );

    }


    function UniState2() {
      return (
        <div className="flex justify-center">
          <button
            className="btn btn-primary"
            onClick={async () => {
              const results: { [key: string]: BigInt[] } = {};
              // iterate universities keys
              for (const university of Object.keys(universities)) {
                // get the votes for the university
                const { data: votes, isLoading } = useScaffoldReadContract({
                  contractName: "YourContract",
                  functionName: "votesMap",
                  args: [university],
                });
                // wait untill the votes are loaded
                while (isLoading) {}
                if (!votes) {
                  console.error("Votes are undefined");
                  return;
                }
                const votesJson = JSON.parse(votes);
                // cast to BigInt each vote
                const votesBigInt: { [key: string]: BigInt } = {};
                for (const [key, value] of Object.entries(votesJson)) {
                  const bigvalue = BigInt(value as string | number);
                  if (key in results) {
                    //  append the vote to list of votes
                    results[key].push(bigvalue);
                  } else {
                    // create the list of votes
                    results[key] = [bigvalue];
                }
              }
              // calculate the sum of the votes
              const votesSum: { [key: string]: BigInt } = {};
              for (const [key, value] of Object.entries(results)) {
                votesSum[key] = sum_encrypted(publicKey, ...value.map(v => v as bigint));
              }
              const decryptedVotes: { [key: string]: number } = {};
              // decrypt the votes
              for (const [key, value] of Object.entries(votesSum)) {
                decryptedVotes[key] = Number(await decrypt(privateKey, value as bigint));
              }
              const decriptedString = JSON.stringify(decryptedVotes);
              console.log(decriptedString);
              
              try {
                await writeYourContractAsync({
                  functionName: "close",
                  args: [decriptedString],
                });
              } catch (e) {
                console.error("Error ending votation:", e);
              }
            }
          }}
          >
            See Results
          </button>
        </div>
      );
    }
      
    return (
      <>
        <div className="flex items-center flex-col flex-grow pt-10">
          <div className="px-5">
            <h1 className="text-center">
              <span className="block text-4xl font-bold">{username}</span>
              <span className="block text-2xl">{subtitle}</span>
            </h1>
            <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
              <Address address={connectedAddress} />
            </div>
          </div>
        </div>
        {!(connectedAddress in universities) && universityAddress === zeroaddress ? <NoEnrolledUser /> : null}
        {!(connectedAddress in universities) && universityAddress !== zeroaddress ? <EnrolledUser /> : null}
        {connectedAddress in universities && VOTE_STATUS === 0 ? <UniState0 /> : null}
        {connectedAddress in universities && VOTE_STATUS === 1 && !hasVoted ? <UniState1NotVoted /> : null}
        {connectedAddress in universities && VOTE_STATUS === 2 ? <UniState2 /> : null}
      </>
    );
  }
};

export default Home;
