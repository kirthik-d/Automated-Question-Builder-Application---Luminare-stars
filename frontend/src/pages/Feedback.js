import React from "react";

const Feedback = () => (
    <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Submit Feedback</h2>
        <form>
            <input
                type="text"
                placeholder="Your Name"
                className="w-full border rounded p-2 mb-4"
            />
            <textarea
                placeholder="Your Feedback"
                className="w-full border rounded p-2 mb-4"
            ></textarea>
            <button className="bg-blue-600 text-white px-4 py-2 rounded">
                Submit
            </button>
        </form>
    </div>
);

export default Feedback;
