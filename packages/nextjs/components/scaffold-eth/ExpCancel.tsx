import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

type ExpCancelProps = {
  proposalID: number;
};

export const ExpCancel = ({ proposalID }: ExpCancelProps) => {
  const { writeAsync: payexp } = useScaffoldContractWrite({
    contractName: "YourContract",
    functionName: "settleExpense",
    args: [BigInt(proposalID), false],
  });

  const handleClick = async () => {
    await payexp();
  };

  return (
    <button
      onClick={handleClick}
      className="bg-red-500 hover:bg-blue-700 text-white font-bold py-1 px-3 text-xs rounded shadow-lg hover:shadow-xl transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110"
    >
      Cancel expense {proposalID}
    </button>
  );
};
