import { useState } from "react";

const Actions = (opts: {
  sectionIndex: number;
  updateSection: (sectionIndex: number, updated: any) => void;
}) => {
  const { sectionIndex, updateSection } = opts;
  const [actionData, setActionData] = useState<any[]>([["", ""]]);

  const handleKeyValueUpdate = (index: number, value: string) => {
    const currentActions = [...actionData];
    currentActions[index][0] = value;
    setActionData(currentActions);
    const actionsObject: { [key: string]: string } = {};
    currentActions.map((action: [string, string]) => {
      actionsObject[action[0]] = action[1];
    });
    updateSection(sectionIndex, { actions: actionsObject });
  };

  const handleValueUpdate = (index: number, value: string) => {
    const currentActions = [...actionData];
    currentActions[index][1] = value;
    setActionData(currentActions);
    const actionsObject: { [key: string]: string } = {};
    currentActions.map((action: [string, string]) => {
      actionsObject[action[0]] = action[1];
    });
    updateSection(sectionIndex, { actions: actionsObject });
  };

  const removeAction = (index: number) => {
    const currentActions = [...actionData];
    currentActions.splice(index, 1);
    setActionData(currentActions);
  };

  const addAction = () => {
    const currentActions = [...actionData];
    currentActions.push(["", ""]);
    setActionData(currentActions);
  };

  const actionBlock = (
    index: number,
    actionKey: string,
    actionValue: string
  ) => {
    return (
      <div key={index}>
        <div className="flex mb-2">
          <input
            placeholder="Variable"
            className="w-full h-10 px-2 mr-2 font-semibold text-gray-700 bg-gray-100 border rounded outline-none focus:outline-none text-md hover:text-black focus:text-black md:text-basecursor-default focus:border-gray-400 focus:border focus:bg-gray-100"
            value={actionKey}
            onChange={(e) => {
              handleKeyValueUpdate(index, e.target.value);
            }}
          ></input>
          <input
            placeholder="Value"
            className="w-full h-10 px-2 font-semibold text-gray-700 bg-gray-100 border rounded outline-none focus:outline-none text-md hover:text-black focus:text-black md:text-basecursor-default focus:border-gray-400 focus:border focus:bg-gray-100"
            value={actionValue}
            onChange={(e) => {
              handleValueUpdate(index, e.target.value);
            }}
          ></input>
        </div>
        {actionData.length === index + 1 && index + 1 > 1 && (
          <button
            className="flex items-center justify-center w-10 p-2 mb-2 text-white bg-red-500"
            onClick={() => {
              removeAction(index);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
        {actionData.length === index + 1 && (
          <button
            className="flex items-center justify-center w-10 p-2 my-2 text-white bg-green-500"
            onClick={() => {
              addAction();
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="pt-4 space-y-2">
      <p className="font-medium text-gray-900">Actions</p>
      <div className="flex flex-col">
        {actionData.map((action, index) =>
          actionBlock(index, action[0], action[1])
        )}
      </div>
    </div>
  );
};

export default Actions;
