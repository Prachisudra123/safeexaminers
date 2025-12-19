// File: /SafeExaminer/SafeExaminer/frontend/src/components/MCQ.js

import React from 'react';

const MCQ = ({ question, options, onSelect }) => {
    return (
        <div className="mcq-container">
            <h3 className="question">{question}</h3>
            <ul className="options-list">
                {options.map((option, index) => (
                    <li key={index} className="option-item">
                        <button 
                            className="option-button" 
                            onClick={() => onSelect(option)}
                        >
                            {option}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MCQ;