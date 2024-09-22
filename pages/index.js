import { useState } from 'react';

export default function Home() {
  const [jsonInput, setJsonInput] = useState('');
  const [fileInput, setFileInput] = useState(null);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');
  const [selectedOptions, setSelectedOptions] = useState([]);

  const filterOptions = [
    { label: "Alphabets", value: "Alphabets" },
    { label: "Numbers", value: "Numbers" },
    { label: "Highest lowercase alphabet", value: "Highest lowercase alphabet" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResponse(null);

    let parsedData;
    try {
      parsedData = JSON.parse(jsonInput);
    } catch {
      setError('Invalid JSON format');
      return;
    }

    const formData = new FormData();
    parsedData.data.forEach(item => {
      formData.append('data[]', item);
    });

    if (fileInput) {
      formData.append('file', fileInput);
    }

    const res = await fetch('/api/bfhl', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    setResponse(data);
    console.log(data);
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedOptions((prev) => [...prev, value]);
    } else {
      setSelectedOptions((prev) => prev.filter((option) => option !== value));
    }
  };

  const normalizeOptionKey = (option) => {
    return option.toLowerCase().replace(/ /g, '_');
  };

  const renderFilteredResponse = () => {
    if (!response) return null;

    return selectedOptions.map(option => {
      const normalizedKey = normalizeOptionKey(option);
      const dataArray = response[normalizedKey];

      return (
        <div key={normalizedKey} className="mb-2">
          <strong>{option}:</strong>
          <ul className="list-disc list-inside">
            {Array.isArray(dataArray) && dataArray.length > 0 ? (
              dataArray.map((item, index) => (
                <li key={index} className="text-black">{item}</li>
              ))
            ) : (
              <li className="text-black">No data available</li>
            )}
          </ul>
        </div>
      );
    });
  };

  const renderFileInfo = () => {
    if (!response || !fileInput) return null;

    return (
      <div className="mt-4 p-4 border border-gray-300 rounded">
        <h2 className="text-lg font-bold mb-2">File Information:</h2>
        <ul className="list-disc list-inside">
          <li><strong>File Valid:</strong> {response.file_valid ? 'Yes' : 'No'}</li>
          <li><strong>MIME Type:</strong> {response.file_mime_type || 'N/A'}</li>
          <li><strong>File Size (KB):</strong> {response.file_size_kb ? response.file_size_kb.toFixed(2) : 'N/A'}</li>
        </ul>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 text-black">
      <h1 className="text-2xl font-bold mb-4">Your Roll Number</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full p-2 border border-gray-300 mb-4"
          placeholder='Enter JSON (e.g., {"data": ["A", "C", "z"]})'
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
        />
        <input
          type="file"
          onChange={(e) => setFileInput(e.target.files[0])}
          className="mb-4"
        />
        <button type="submit" className="bg-blue-500 text-black p-2 rounded">Submit</button>
      </form>
      {error && <p className="text-red-500">{error}</p>}
      {response && (
        <>
          <div className="my-4">
            <h2 className="text-lg font-bold">Select Filters:</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {filterOptions.map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    value={option.value}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold">Filtered Response:</h2>
            {renderFilteredResponse()}
          </div>

          {renderFileInfo()}
        </>
      )}
    </div>
  );
}
