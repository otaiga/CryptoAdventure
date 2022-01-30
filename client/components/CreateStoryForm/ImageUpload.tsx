import axios from "axios";
import {
  showErrorNotification,
  showSuccessNotification,
} from "../../utils/notification";

const ImageUpload = (opts: {
  sectionIndex: number;
  updateSection: (sectionIndex: number, updated: any) => void;
  setIsLoading: any;
}) => {
  const { sectionIndex, updateSection, setIsLoading } = opts;

  const updateImagePath = async (fileData: File) => {
    setIsLoading(true);
    try {
      const res = await axios.post("/api/storeImage", fileData);
      if (!res.data.imageId) {
        throw Error("No imageId returned");
      }
      const image = res.data.imageId;
      updateSection(sectionIndex, { image });
      showSuccessNotification({
        message: "Image update",
        description: "Image updated successfully",
      });
      setIsLoading(false);
    } catch (err) {
      console.log(err);
      setIsLoading(false);
      showErrorNotification({
        message: "Error",
        description: "Error storing image",
      });
    }
  };

  return (
    <div className="flex py-4">
      <div className="mb-3 w-96">
        <label className="inline-block mb-2 font-medium text-gray-900 form-label">
          Section Image
        </label>
        <input
          className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
          type="file"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              const image = e.target.files[0];
              updateImagePath(image);
            }
          }}
        />
      </div>
    </div>
  );
};

export default ImageUpload;
