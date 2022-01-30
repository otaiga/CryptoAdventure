import { useState } from "react";
import axios from "axios";
import {
  showErrorNotification,
  showSuccessNotification,
} from "../../utils/notification";

type AudioInputType = {
  [key: string]: string | File;
};

const AudioUpload = (opts: {
  sectionIndex: number;
  updateSection: (sectionIndex: number, updated: any) => void;
  setIsLoading: any;
}) => {
  const { sectionIndex, updateSection, setIsLoading } = opts;
  const [audioData, setAudioData] = useState<AudioInputType[]>([
    { type: "MP3" },
  ]);

  const updateType = (index: number, value: string) => {
    const currentAudioData = [...audioData];
    currentAudioData[index].type = value;
    if (value === "Condition") {
      currentAudioData[index].rule = "equals";
    }
    setAudioData(currentAudioData);
    updateSection(sectionIndex, { audio: currentAudioData });
  };

  const updateConditional = (
    index: number,
    updated: { [key: string]: string }
  ) => {
    const currentAudioData = [...audioData];
    currentAudioData[index] = { ...currentAudioData[index], ...updated };
    setAudioData(currentAudioData);
  };

  const updateAudioPath = async (
    index: number,
    fileData: File,
    conditional?: string
  ) => {
    setIsLoading(true);
    const currentAudioData = [...audioData];
    try {
      const res = await axios.post("/api/storeAudio", fileData);
      if (!res.data.audioId) {
        throw Error("No audioId returned");
      }
      const fileLocation = res.data.audioId;
      if (conditional && currentAudioData[index].type === "Condition") {
        currentAudioData[index][conditional] = fileLocation;
      } else {
        currentAudioData[index].audio = fileLocation;
      }
      setAudioData(currentAudioData);
      updateSection(sectionIndex, { audio: currentAudioData });
      setIsLoading(false);
      showSuccessNotification({
        message: "Audio update",
        description: "Audio updated successfully",
      });
    } catch (err) {
      setIsLoading(false);
      console.log(err);
      showErrorNotification({
        message: "Error",
        description: "Error storing image",
      });
    }
  };

  const addAudioinput = () => {
    const currentAudioData = [...audioData];
    currentAudioData.push({ type: "MP3" });
    setAudioData(currentAudioData);
  };

  const removeAudioinput = (index: number) => {
    const currentAudioData = [...audioData];
    currentAudioData.splice(index, 1);
    setAudioData(currentAudioData);
  };

  const audioUploadInput = (index: number, audioInput: any) => {
    const renderFileUpload = (conditional?: string) => {
      return (
        <input
          className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
          type="file"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              updateAudioPath(index, e.target.files[0], conditional);
            }
          }}
        />
      );
    };

    const renderConditional = () => {
      return (
        <div className="flex flex-col">
          <div className="flex mb-2">
            <input
              placeholder="Variable Name"
              className="w-full h-10 px-2 mr-2 font-semibold text-gray-700 bg-gray-100 border rounded outline-none focus:outline-none text-md hover:text-black focus:text-black md:text-basecursor-default focus:border-gray-400 focus:border focus:bg-gray-100"
              onChange={(e) => {
                const value = e.target.value;
                updateConditional(index, { var: value });
              }}
            ></input>
            <div className="relative inline-block w-64">
              <select
                className="block w-full px-4 py-2 pr-8 leading-tight bg-white border border-gray-400 rounded shadow appearance-none hover:border-gray-500 focus:outline-none focus:shadow-outline"
                onChange={(e) => {
                  const value = e.target.value;
                  updateConditional(index, { rule: value });
                }}
              >
                <option>Equals</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 pointer-events-none">
                <svg
                  className="w-4 h-4 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center mb-2">
              <p className="px-2 w-18">"True"</p>
              {renderFileUpload("true")}
            </div>
            <div className="flex items-center">
              <p className="px-2 w-18">"False"</p>
              {renderFileUpload("false")}
            </div>
          </div>
        </div>
      );
    };

    return (
      <div key={index} className="">
        <div className="flex flex-col p-2 mb-2 border">
          <div className="flex items-center mb-2">
            <p className="mr-2">Type:</p>
            <div className="relative inline-block w-64">
              <select
                className="block w-full px-4 py-2 pr-8 leading-tight bg-white border border-gray-400 rounded shadow appearance-none hover:border-gray-500 focus:outline-none focus:shadow-outline"
                onChange={(e) => {
                  const chosen = e.target.value === "MP3" ? "MP3" : "Condition";
                  updateType(index, chosen);
                }}
              >
                <option>MP3</option>
                <option>Condition</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 pointer-events-none">
                <svg
                  className="w-4 h-4 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
          {audioInput.type === "Condition"
            ? renderConditional()
            : renderFileUpload()}
        </div>
        {audioData.length === index + 1 && index + 1 > 1 && (
          <button
            className="flex items-center justify-center w-10 p-2 mb-2 text-white bg-red-500"
            onClick={() => {
              removeAudioinput(index);
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
        {audioData.length === index + 1 && (
          <button
            className="flex items-center justify-center w-10 p-2 mb-2 text-white bg-green-500"
            onClick={() => {
              addAudioinput();
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
    <div className="flex flex-col pt-4 space-y-2">
      <label className="font-medium text-gray-900">Audio Upload</label>
      <div className="flex flex-col">
        {audioData.map((audioInput, index) =>
          audioUploadInput(index, audioInput)
        )}
      </div>
    </div>
  );
};

export default AudioUpload;
