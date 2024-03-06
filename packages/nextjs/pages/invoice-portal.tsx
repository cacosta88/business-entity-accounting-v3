//eslint-disable-next-line
import { useEffect, useRef, useState } from "react";
//import { CSSProperties } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";
//import { AddressInput, EtherInput, InputBase } from "~~/components/scaffold-eth";
import { Address } from "~~/components/scaffold-eth";
import { InvoicePaidCheck } from "~~/components/scaffold-eth";
import { PayInvoice } from "~~/components/scaffold-eth";
//import { Capitaladjvote, ExpAdjVote, ExpCancel, ExpSettle } from "~~/components/scaffold-eth";
//eslint-disable-next-line
import { useScaffoldContractRead, useScaffoldContractWrite, useScaffoldEventHistory } from "~~/hooks/scaffold-eth";

const Invoice: NextPage = () => {
  const { address } = useAccount();

  const { data: InvoiceIssuedEvents } = useScaffoldEventHistory({
    contractName: "YourContract",
    eventName: "InvoiceIssued",
    fromBlock: BigInt(0),
    watch: true,

    blockData: true,
    transactionData: true,
    receiptData: true,
  });

  const [InvoiceIssuedEventsArray, setInvoiceIssuedEventsArray] = useState<any>([]);

  useEffect(() => {
    if (InvoiceIssuedEvents) {
      const parsedEvents = InvoiceIssuedEvents.map((event: any) => ({
        invoiceID: Number(event.args.invoiceID),
        payor: event.args.payor,
        amount: Number(event.args.amount) / 1e18,
        description: event.args.description,
        period: Number(event.args.period),
        timestamp: Number(event.block.timestamp) * 1000,
      })).filter(event => event.payor.toLowerCase() === address?.toLowerCase());

      setInvoiceIssuedEventsArray(parsedEvents);
    }
  }, [InvoiceIssuedEvents, address]); // Add address as a dependency

  const [invoiceDescription, setInvoiceDescription] = useState("");

  useEffect(() => {
    if (invoiceDescription) {
      setInvoiceDescription(invoiceDescription);
    }
  }, [invoiceDescription]);

  return (
    <>
      <MetaHeader />
      <div className="flex items-center flex-col flex-grow pt-10">
        This is the invoice portal for <Address address={address} />
        <div className="mt-4">
          {InvoiceIssuedEventsArray.length > 0 && (
            <table className="min-w-full divide-y divide-gray-200 shadow-lg rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Invoice ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Payor
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Description
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Period
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Timestamp
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Paid
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Pay
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {InvoiceIssuedEventsArray.map((event: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-100">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.invoiceID}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.payor}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {event.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.period}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {new Date(event.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <InvoicePaidCheck proposalID={Number(event.invoiceID)} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <PayInvoice proposalID={Number(event.invoiceID)} amount={event.amount} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};

export default Invoice;
