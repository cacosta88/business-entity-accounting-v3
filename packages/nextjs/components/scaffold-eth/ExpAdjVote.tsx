import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

type ExpVoteProps = {
  proposalID: number;
};

export const ExpAdjVote = ({ proposalID }: ExpVoteProps) => {
  const { writeAsync: capitalVote } = useScaffoldContractWrite({
    contractName: "YourContract",
    functionName: "voteForExpenseProposal",
    args: [BigInt(proposalID)],
  });

  const handleClick = async () => {
    await capitalVote();
  };

  return (
    <button
      onClick={handleClick}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 text-xs rounded shadow-lg hover:shadow-xl transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110"
    >
      Vote on Proposal {proposalID}
    </button>
  );
};
