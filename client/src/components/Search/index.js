import { React, useState, useEffect } from "react";
import SearchBar from "./SearchBar";
import FilterPanel from "./FilterPanel";
import NavBar from "../NavBar";
import List from "./List";
import "./styles.css";
import axios from "axios";
import { min } from "date-fns";

function Search() {
  const [searchInput, setSearchInput] = useState("");
  const [selectedPrice, setSelectedPrice] = useState([20, 60]);
  const [experienceList, setExperienceList] = useState([
    { id: 1, checked: true, label: "> 15 years" },
    { id: 2, checked: true, label: "5-15 years" },
    { id: 3, checked: true, label: "5 years" },
  ]);

  const [allMentors, setAllMentors] = useState([]);
  const [filteredMentors, setFilteredMentors] = useState(allMentors);
  console.log("ALL MENTORS", allMentors);

  const handleChangePrice = (event, value) => {
    setSelectedPrice(value);
  };

  const handleChangeExperience = (id) => {
    const experienceStateList = experienceList;
    const changeCheckedExperience = experienceStateList.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setExperienceList(changeCheckedExperience);
  };

  let all = [];

  const createSpecialtiesArr = (res1, res2) => {
    res1.data.forEach((element) => {
      element.specialties = [element.specialty];
      let index = all.findIndex((mentor) => mentor.name === element.name);

      index === -1
        ? all.push(element)
        : all[index].specialties.push(element.specialty);

      element.ratingArr = [];
    });

    res2.data.forEach((review) => {
      let index2 = all.findIndex(
        (mentor) => mentor.user_id === review.mentor_id
      );
      console.log("MENTOR ID:", review.mentor_id);
      console.log("INDEX2:", index2);

      if (review.rating) {
        all[index2].ratingArr.push(review.rating);
      }
    });

    all.forEach((mentor) => {
      mentor.ratingAvg =
        mentor.ratingArr.reduce((a, b) => a + b, 0) / mentor.ratingArr.length;
    });

    setAllMentors(all);
    setFilteredMentors(all);
  };
  /////////

  const applyFilters = () => {
    let updated = allMentors;

    // Years of Experience Filter
    const experienceChecked = experienceList.filter((item) => item.checked);

    if (experienceChecked) {
      let mentorsToKeep = [];
      experienceChecked.forEach((exp) => {
        let toKeep = [];
        if (exp.id === 1) {
          toKeep = updated.filter((mentor) => mentor.years_of_experience >= 15);
          toKeep.forEach((mentor) => mentorsToKeep.push(mentor));
        } else if (exp.id === 2) {
          toKeep = updated.filter(
            (mentor) =>
              mentor.years_of_experience <= 15 &&
              mentor.years_of_experience >= 5
          );
          toKeep.forEach((mentor) => mentorsToKeep.push(mentor));
        } else if (exp.id === 3) {
          toKeep = updated.filter(
            (mentor) =>
              mentor.years_of_experience <= 5 && mentor.years_of_experience >= 0
          );
          toKeep.forEach((mentor) => mentorsToKeep.push(mentor));
        }
      });
      updated = mentorsToKeep;
    }

    // Price Filter
    const minPrice = selectedPrice[0];
    const maxPrice = selectedPrice[1];

    updated = updated.filter(
      (mentor) => mentor.price <= maxPrice && mentor.price >= minPrice
    );
    console.log("UPDATED", updated);
    setFilteredMentors(updated);
  };

  useEffect(() => {
    axios
      .all([
        axios.get("http://localhost:8080/mentors/expertise"),
        axios.get("http://localhost:8080/mentors/sessions"),
      ])
      .then(
        axios.spread((...res) => {
          // console.log(res[0].data);
          // console.log(res[1].data);
          createSpecialtiesArr(res[0], res[1]);
        })
      )
      .catch((err) => {
        console.log("error:", err);
      });
  }, []);

  useEffect(() => {
    applyFilters();
  }, [selectedPrice, experienceList, searchInput]);

  return (
    <div className="search">
      <NavBar />
      <SearchBar
        value={searchInput}
        changeInput={(e) => setSearchInput(e.target.value)}
      />
      <div className="content">
        <div className="filter-pane">
          Filters:
          <FilterPanel
            selectedPrice={selectedPrice}
            changePrice={handleChangePrice}
            experienceList={experienceList}
            changeExperience={handleChangeExperience}
          />
        </div>
        <div className="list-pane">
          <List list={filteredMentors} input={searchInput} />
        </div>
      </div>
    </div>
  );
}

export default Search;
