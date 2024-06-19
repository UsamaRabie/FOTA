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
      'Read': 'https://fotaWithKmola.api/readEndpoint',
      'Write': 'https://fotaWithKmola.api/writeEndpoint',
      'Erase': 'https://fotaWithKmola.api/eraseEndpoint',
      'Update': 'https://fotaWithKmola.api/updateEndpoint', 
    };

    const endpoint = endpointMapping[choices.firstChoice];

    if (!endpoint) {
      setData({ failed: "Invalid choice" });
      setSubmitting(false);
      return;
    }

    try {
      let response;
      if (choices.firstChoice === 'Update') {
        response = await axios.post(endpoint, choices);
        console.log("Making Request")
      } else {
        response = await axios.get(endpoint);
        console.log("Making Request")
      }

      if (response && response.status === 200) {
        setData(response.data);
        console.log("Request Done")
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Select your choices</h1>

      <div className="mb-4 w-72">
        <label htmlFor="firstChoice" className="block text-lg font-medium text-gray-700 mb-2">First Choice</label>
        <select
          id="firstChoice"
          value={choices.firstChoice}
          onChange={handleChange}
          className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="" disabled>Select an option</option>
          <option value="Read">Read</option>
          <option value="Write">Write</option>
          <option value="Erase">Erase</option>
          <option value="Update">Update</option>
        </select>
      </div>

      <div className="mb-4 w-72">
        <label htmlFor="secondChoice" className="block text-lg font-medium text-gray-700 mb-2">Second Choice</label>
        <select
          id="secondChoice"
          value={choices.secondChoice}
          onChange={handleChange}
          className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="" disabled>Select an option</option>
          <option value="Option A">Option A</option>
          <option value="Option B">Option B</option>
          <option value="Option C">Option C</option>
        </select>
      </div>

      <div className="mb-4 w-72">
        <label htmlFor="numberInput" className="block text-lg font-medium text-gray-700 mb-2">Number Input (Enabled if "Read")</label>
        <input
          type="number"
          id="numberInput"
          value={choices.numberInput}
          onChange={handleChange}
          disabled={choices.firstChoice !== 'Read'}
          className={`block w-full px-3 py-2 border ${choices.firstChoice === 'Read' ? 'border-gray-300' : 'border-gray-200 bg-gray-200 cursor-not-allowed'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
        />
      </div>

      <div className="mb-4 w-72">
        <label htmlFor="fileInput" className="block text-lg font-medium text-gray-700 mb-2">File Input (Enabled if "Update")</label>
        <div className="relative flex items-center justify-center">
          <input
            type="file"
            id="fileInput"
            onChange={handleChange}
            disabled={choices.firstChoice !== 'Update'}
            className={`absolute inset-0 w-full h-full opacity-0 ${choices.firstChoice === 'Update' ? "cursor-pointer" : "cursor-not-allowed"}`}
          />
          <button
            type="button"
            className={`flex items-center justify-center w-16 h-16 rounded-full text-white ${choices.firstChoice === 'Update' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-200 cursor-not-allowed'}`}
            disabled={choices.firstChoice !== 'Update'}
          >
            <FontAwesomeIcon icon={faUpload} className="text-2xl" />
          </button>
        </div>
      </div>

      <div className="mt-6 w-72">
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

      <div className='mt-6'>
        <button 
          onClick={handleSubmit} 
          disabled={choices.firstChoice === "" || submitting} 
          className={`text-center py-3 px-5 rounded-xl text-white ${choices.firstChoice === "" ? "bg-gray-200 cursor-not-allowed" : "bg-green-600 hover:bg-green-800"}`}
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  );
}
