import React, {useState} from 'react';
import "./css/kundali.css"



function Kundali() {

    const [formData, setFormData] = useState({
        name: '',
        gender: '',
        birthdate: '',
        birthtime: '',
        fatherName: '',
        place: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission here
        console.log(formData);
    };
        const [selectedType, setSelectedType] = useState('');
        const [selectedSubType, setSelectedSubType] = useState('');
        const [price, setPrice] = useState(0);
    
        const handleTypeChange = (e) => {
            setSelectedType(e.target.value);
            setSelectedSubType('');
            setPrice(0);
        };
    
        const handleSubTypeChange = (e) => {
            setSelectedSubType(e.target.value);
            // Calculate price based on selected options
            // Here you can implement your price calculation logic
            setPrice(10); // Example price
        };
    
        const handleQuoteButtonClick = () => {
            // Handle quote button click
            // You can perform any action here, like displaying a modal with the quote details
            console.log('Quote button clicked');
        };


  return (
    <div className='kundali-body'>
        <div className='kundali-form'>
        <form onSubmit={handleSubmit}>
            <label>
                Name:
                <input type="text" name="name" value={formData.name} onChange={handleChange} />
            </label>
            <label>
                Gender:
                <select name="gender" value={formData.gender} onChange={handleChange}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>
            </label>
            <label>
                Birthdate:
                <input type="date" name="birthdate" value={formData.birthdate} onChange={handleChange} />
            </label>
            <label>
                Birthtime:
                <input type="time" name="birthtime" value={formData.birthtime} onChange={handleChange} />
            </label>
            <label>
                Father's Name:
                <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} />
            </label>
            <label>
                Place:
                <input type="text" name="place" value={formData.place} onChange={handleChange} />
            </label>
            <button type="submit">Submit</button>
        </form>
        </div>
        <div className="kundali-buy">
            <h2>Kundali Purchase</h2>
            <div>
                <label>Type:</label>
                <select value={selectedType} onChange={handleTypeChange}>
                    <option value="">Select Type</option>
                    <option value="kundali">Kundali</option>
                    <option value="patri">Patri</option>
                </select>
            </div>
            {selectedType && (
                <div>
                    <label>{selectedType === 'kundali' ? 'Kundali Type' : 'Patri Type'}:</label>
                    <select value={selectedSubType} onChange={handleSubTypeChange}>
                        <option value="">Select Sub Type</option>
                        {selectedType === 'kundali' ? (
                            <>
                                <option value="type1">Type1</option>
                                <option value="type2">Type2</option>
                                <option value="type3">Type3</option>
                                <option value="type4">Type4</option>
                            </>
                        ) : (
                            <>
                                <option value="patri1">Patri1</option>
                                <option value="patri2">Patri2</option>
                            </>
                        )}
                    </select>
                </div>
            )}
            {selectedSubType && (
                <div>
                    <p>Price: ${price}</p>
                </div>
            )}
            <button onClick={handleQuoteButtonClick}>Get Quote</button>
        </div>
    </div>
  )
}

export default Kundali