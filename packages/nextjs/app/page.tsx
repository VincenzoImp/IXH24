"use client";

import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { universities } from "./layout";
import { parseUnits } from "viem";
import { useState } from "react";

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

  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
  if (isLoading2 || isLoading || !connectedAddress || !universityAddress) return null;
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
        {connectedAddress in universities && VOTE_STATUS === 0 ? <UniState0 /> : null}
        {!(connectedAddress in universities) && universityAddress === zeroaddress ? <NoEnrolledUser /> : null}
        {!(connectedAddress in universities) && universityAddress !== zeroaddress ? <EnrolledUser /> : null}
      </>
    );
  }
};

export default Home;
