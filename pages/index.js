import { useState } from 'react';

export default function Home() {
  const [jsonInput, setJsonInput] = useState('');
  const [fileInput, setFileInput] = useState(null);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');
  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResponse(null);

    // Validate JSON input
    let parsedData;
    try {
      parsedData = JSON.parse(jsonInput);
    } catch {
      setError('Invalid JSON format');
      return;
    }

    // Prepare form data
    const formData = new FormData();
    parsedData.data.forEach(item => {
      formData.append('data[]', item);
    });

    if (fileInput) {
      formData.append('file', fileInput);
    }

    // Call the backend API
    const res = await fetch('/api/bfhl', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    setResponse(data);
    console.log(data);
  };

  const handleSelectChange = (e) => {
    const options = Array.from(e.target.selectedOptions).map(option => option.value);
    setSelectedOptions(options);
  };

  // Normalize the key (e.g., "Highest lowercase alphabet" => "highest_lowercase_alphabet")
  const normalizeOptionKey = (option) => {
    return option.toLowerCase().replace(/ /g, '_');
  };

  const renderFilteredResponse = () => {
    if (!response) return null;

    return selectedOptions.map(option => {
      const normalizedKey = normalizeOptionKey(option);
      return (
        <div key={normalizedKey} className="mb-2">
          <strong>{option}:</strong>
          <pre className="text-black">{JSON.stringify(response[normalizedKey], null, 2)}</pre>
        </div>
      );
    });
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
          <select multiple onChange={handleSelectChange} className="border p-2 my-4">
            <option value="Alphabets">Alphabets</option>
            <option value="Numbers">Numbers</option>
            <option value="Highest lowercase alphabet">Highest lowercase alphabet</option>
          </select>
          <div>
            <h2 className="text-lg font-bold">Filtered Response:</h2>
            {renderFilteredResponse()}
          </div>
        </>
      )}
    </div>
  );
}
