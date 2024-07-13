"use client"
import { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';

export default function Home() {
  const [choices, setChoices] = useState({
    firstChoice: '',
    secondChoice: '',
    numberInput: '',
    fileInput: null,
  });
  const [data, setData] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { id, value, files } = e.target;
    setChoices((prevChoices) => ({
      ...prevChoices,
      [id]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    // Define the endpoint mapping
    const endpointMapping = {
      'Read': `http://192.168.1.3:5000/read_from_esp`,
      'Write': `http://192.168.1.3:5000/get_chip_id`,
      'Erase': `http://192.168.1.3:5000/erase_flash`,
      'Update': 'http://192.168.1.3:5000/update_flash',
    };


    const endpoint = endpointMapping[choices.firstChoice];

    if (!endpoint) {
      setData({ failed: "Invalid choice" });
      setSubmitting(false);
      return;
    }


    // Add query parameters based on choices
    let params = {};
    if (choices.firstChoice === 'Read') {
      params = { address: choices.numberInput, ID_DEVICE: choices.secondChoice };
    } else if (choices.firstChoice === 'Write' || choices.firstChoice === 'Roll_back') {
      params = { ID_DEVICE: choices.secondChoice };
    } else if (choices.firstChoice === 'Erase') {
      params = { ID_DEVICE: choices.secondChoice };
    }

    try {
      let response;
      if (choices.firstChoice === 'Update') {
        // form schema
        //"json_data={\"ID_DEVICE\": \"15\", \"ID_OPERATION\": \"17\", \"CODESIZE\": 10, \"type_update\":1 \"FRAME_NUM\": 0, \"TOTAL_FRAMES\": 1}" -F "firmware=@diff.bin"
        //ID_DEVICE SECOND_CHOICE
        //ID_OPERATION FIRST_CHOICE
        //CODESIZE SIZE OF FILEINPUT
        //type_update 1 for patching 2 for full update
        //FRAME_NUM 0
        //TOTAL_FRAMES (SIZE OF FILEINPUT/1024) IF (SIZE OF FILEINPUT%1024) != 0 THEN TOTAL_FRAMES += 1
        let tot_frame = choices.fileInput.size / 1024;
        if (choices.fileInput.size % 1024 != 0) {
          tot_frame += 1;
        }
        const json_data = {
          ID_DEVICE: choices.secondChoice,
          ID_OPERATION: choices.firstChoice,
          CODESIZE: choices.fileInput.size,
          type_update: 1,
          FRAME_NUM: 0,
          TOTAL_FRAMES: tot_frame
        };
        const formData = new FormData();
        formData.append('json_data', JSON.stringify(json_data));
        formData.append('firmware', choices.fileInput);

        response = await axios.post(endpoint, formData);
        console.log("Making Request")
      } else {
        response = await axios.get(endpoint, { params });
        console.log("Making Request")
      }
      console.log(response)
      if (response) {
        setData(response.data);
        console.log("Request Done")
        console.log(response.data)
      } else {
        setData({ failed: "Oops..! Sorry, failed to make the request" });
      }
    } catch (err) {
      console.error("Error while making request: ", err);
      setData({ failed: "Oops..! Sorry, failed to make the request" });
    }

    setSubmitting(false);
  };

  return (
<div className='flex justify-center items-center  min-h-screen bg-gray-100 overflow-x-hidden'>
      
    <div className='  flex gap-10 justify-center  flex-col md:flex-row  p-4'>
        
        <div className=" mx-5  pt-3 pb-4 rounded-xl  w-72 lg:w-[500px] ">
          <h1 className="text-2xl font-bold mb-4 text-indigo-800">Select your choices</h1>
      
          <div className="mb-4 w-72 lg:w-[500px]">
            <label htmlFor="firstChoice" className="block text-lg font-medium text-indigo-800  mb-2">First Choice</label>
            <select
              id="firstChoice"
              value={choices.firstChoice}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="" disabled>Select an option</option>
              <option value="Read">ReadAddress</option>
              <option value="Write">Get_Chip_id</option>
              <option value="Erase">Erase_flash</option>
              <option value="Update">Update_flash</option>
              <option value="Roll_back">Roll_back</option>
            </select>
          </div>
      
          <div className="mb-4 w-72 lg:w-[500px]">
            <label htmlFor="secondChoice" className="block text-lg font-medium text-indigo-800  mb-2">Second Choice</label>
            <select
              id="secondChoice"
              value={choices.secondChoice}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="" disabled>Select an option</option>
              <option value="OptionA">ID_FIRST</option>
              <option value="Option B">ID_SECOND</option>
              <option value="Option C">ID_THIRD</option>
            </select>
          </div>
      
          <div className="mb-4 w-72 lg:w-[500px]">
            <label htmlFor="numberInput" className="block text-lg font-medium text-indigo-800  mb-2">Number Input (Enabled if "Read")</label>
            <input
              type="number"
              id="numberInput"
              value={choices.numberInput}
              onChange={handleChange}
              disabled={choices.firstChoice !== 'Read'}
              className={`block w-full px-3 py-2 border ${choices.firstChoice === 'Read' ? 'border-gray-300' : 'border-gray-200 bg-gray-200 cursor-not-allowed'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
            />
          </div>
      
          <div className="mb-4 w-72 lg:w-[500px]">
            <label htmlFor="fileInput" className="block text-lg font-medium text-indigo-800  mb-2">File Input (Enabled if "Update")</label>
            <div className="relative flex items-center justify-center">
              <input
                type="file"
                id="fileInput"
                accept=".bin"
                onChange={handleChange}
                disabled={choices.firstChoice !== 'Update'}
                className={`absolute inset-0 w-full h-full opacity-0 ${choices.firstChoice === 'Update' ? "cursor-pointer" : "cursor-not-allowed"}`}
              />
              <button
                type="button"
                className={`flex items-center mt-7 justify-center w-16 h-16 rounded-full text-white ${choices.firstChoice === 'Update' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-200 cursor-not-allowed'}`}
                disabled={choices.firstChoice !== 'Update'}
              >
                <FontAwesomeIcon icon={faUpload} className="text-2xl" />
              </button>
            </div>
          </div>
      
          <div className="mt-6 w-72 lg:w-[500px]">
            <p className="text-lg">
              First Choice: <span className="font-medium text-indigo-600">{choices.firstChoice || 'None'}</span>
            </p>
            <p className="text-lg">
              Second Choice: <span className="font-medium text-indigo-600">{choices.secondChoice || 'None'}</span>
            </p>
            <p className="text-lg">
              Number Input: <span className="font-medium text-indigo-600">{choices.numberInput || 'None'}</span>
            </p>
            <p className="text-lg">
              File Input: <span className="font-medium text-indigo-600">{choices.fileInput ? choices.fileInput.name : 'None'}</span>
            </p>
          </div>
      
          <div className='mt-6 text-center'>
            <button 
              onClick={handleSubmit} 
              disabled={choices.firstChoice === "" || submitting} 
              className={`text-center py-3 px-5 rounded-xl text-white ${choices.firstChoice === "" ? "bg-gray-200 cursor-not-allowed" : "bg-green-600 hover:bg-green-800"}`}
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
  
        <div className="mx-5 border-4 border-indigo-500 px-3 pt-3 pb-4 w-72  lg:w-[500px] rounded-xl text-indigo-800 font-bold align-middle min-h-[500px]">
          <h1 className='text-center text-2xl my-5 '>Request Result</h1>
          {Object.entries(data).map(([key, value]) => (
            <p className="text-lg" key={key}>
              {key}: <span className="font-medium text-indigo-600">{value ? value.name || value : 'None'}</span>
            </p>
          ))}
        </div>
    </div>
</div>
  );
}