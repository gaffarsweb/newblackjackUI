import React from "react";
import { BiRectangle } from "react-icons/bi";
import { GoGraph } from "react-icons/go";
import { FaRegStar } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";

function Statistics() {
  return (
    <div className="statistics">
      <div className="statistics-container">
        <div className="statistics-icons">
          <button className="icon-btn">
            <IoSettingsOutline />
          </button>
          <button className="icon-btn">
            <BiRectangle />
          </button>
          <button className="icon-btn">
            <GoGraph />
          </button>
          <button className="icon-btn">
            <FaRegStar />
          </button>
        </div>

        <button className="fairness-btn">Fairness</button>
      </div>
    </div>
  );
}

export default Statistics;
