"use strict";
// let map, eventMap;
class Workout {
  id = Date.now().toString().slice(-10);
  date = new Date();
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }
  _getDescription() {
    const month = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "Nov",
      "Dec"
    ];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(
      1
    )} on  ${month[this.date.getMonth()]} ${this.date.getDate()}`;
  }
}
class Running extends Workout {
  type = "running";
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._getDescription();
  }
  calcPace() {
    this.pace = this.cadence / this.duration;
    // return this.pace;
  }
}
class Cycling extends Workout {
  type = "cycling";
  constructor(coords, distance, duration, elevGain) {
    super(coords, distance, duration);
    this.elevGain = elevGain;
    this.calcElev();
    this._getDescription();
  }
  calcElev() {
    this.speed = this.distance / (this.duration / 60);
    // return this.speed;
  }
}
// console.log(new Running([121, -123], 23, 30, 30 ) ) ;
//
const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

class App {
  #map;
  #eventMap;
  #workouts = [];
  constructor() {
    this._getStorage();
    this._getPosition();
    // console.log(this);
    form.addEventListener("submit", this._newWorkOut.bind(this));
    inputType.addEventListener("change", this._toggleElevationField);
    containerWorkouts.addEventListener("click", this._moveToPopup.bind(this));
    // function () {
    // if (inputType.value === "running") {
    //   console.log(document
    //     .querySelector(".form__row")
    //     .classList.contains("form__row--hidden"));
    // } else {
    //   console.log(document
    //     .querySelector(".form__row")
    //     .classList.contains("form__row--hidden"));
    // }

    // console.log(inputType.value);
    // });
  }
  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          // console.log(this);
          alert("unable to locate your location  ");
        }
      );
    }
  }
  _loadMap(position) {
    console.log(this);
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const currentPosition = [latitude, longitude];
    this.#map = L.map("map").setView(currentPosition, 10);
    console.log(currentPosition);
    console.log(this.#map);

    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.#map);

    console.log(currentPosition);
    console.log(this);
    this.#map.on("click", this._showForm.bind(this));
    this.#workouts.forEach(work => {
      this._renderWorkoutMarker(work);
    });
    // console.log(currentPosition);
  }
  _showForm(eventM) {
    console.log(this.#eventMap);
    this.#eventMap = eventM;
    console.log(this, this.#eventMap);

    form.classList.remove("hidden");
    inputDistance.focus();
  }
  _toggleElevationField() {
    console.log("toggle");
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
  }
  _newWorkOut(e) {
    const validate = (...inputs) => inputs.every(inp => Number.isFinite(inp));
    const positive = (...inputs) => inputs.every(inp => inp > 0);

    e.preventDefault();
    const type = inputType.value;
    const distance = Number(inputDistance.value);
    const duration = Number(inputDuration.value);
    const { lat, lng } = this.#eventMap.latlng;
    let workout;
    // const {lat, lng} = this.#eventMap.latlng;
    if (type === "running") {
      const cadence = Number(inputCadence.value);
      // console.log(
      //   validate(distance, duration, cadence),
      //   positive(distance, duration, cadence)
      // );

      if (
        !validate(distance, duration, cadence) ||
        !positive(distance, duration, cadence)
      )
        return alert("wrong input");

      workout = new Running([lat, lng], distance, duration, cadence);
      this.#workouts.push(workout);
      console.log(workout.date.getDate());

      console.log("running");
    }

    if (type === "cycling") {
      const elevation = Number(inputElevation.value);
      if (
        !validate(distance, duration, elevation) ||
        !positive(distance, duration)
      )
        return alert("wrong input");

      workout = new Cycling([lat, lng], distance, duration, elevation);
      this.#workouts.push(workout);

      console.log("cycling");
    }
    // if(distance && duration && distance > 0 && duration > 0){

    // }
    // else{

    // }
    console.log(workout);
    console.log(this.#workouts);

    inputCadence.value = inputDistance.value = inputDuration.value = "";

    inputCadence.blur();

    // console.log(distance, duration, cadence);
    // console.log(inputType.value);
    console.log(this);
    this._renderWorkoutMarker(workout);
    this._renderWorkout(workout);
    this._setStorage(this.#workouts);
    // this._getStorage();
    // console.log(lat,  lng);

    form.classList.add("hidden");
  }

  _renderWorkoutMarker(workout) {
    // workout._getDescription();
    console.log(workout);
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 480,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`
        })
      )
      .setPopupContent(`${workout.description} `)
      .openPopup();
  }
  _renderWorkout(workout) {
    console.log(workout.type);
    console.log(workout.description);
    const html = `<li class="workout workout--${workout.type}" data-id=${
      workout.id
    } data-na ='sa'>
    <h2 class="workout__title"> ${workout.description}</h2>
    <div class="workout__details">
      <span class="workout__icon">🏃‍♂️</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>
    <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${
              workout.type === "running" ? workout.pace : workout.speed
            }</span>
            <span class="workout__unit">${
              workout.type == "running" ? "Min/Km" : "Km/h"
            }</span>
          </div>
    <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${
              workout.type == "running" ? workout.cadence : workout.elevGain
            }</span>
            <span class="workout__unit">${
              workout.type == "running" ? "SPM" : "M"
            }</span>
          </div>
   </li>`;
    document.querySelector(".workouts").insertAdjacentHTML("beforeend", html);
    // console.log(html);
  }
  _moveToPopup(e) {
    console.log(e.target.closest(".workout"));
    // console.log(e);
    console.log(this.#workouts);
    // console.log(e.target);
    const workMove = e.target.closest(".workout");
    if (!workMove) return;
    // console.log(workMove.dataset);// it return custom data from element
    const workoutobj = this.#workouts.find(
      work => work.id === workMove.dataset.id
    );
    this.#map.setView(workoutobj.coords, 10, {
      animate: true,
      pan: {
        duration: 1
      }
    });

    //  console.log (this.#workouts.find(work => work.id === workMove.dataset.id));
    console.log(workoutobj);
  }
  _setStorage(workout) {
    console.log(workout);
    localStorage.setItem("worko", JSON.stringify(workout));
    // this._getStorage();
  }
  _getStorage() {
    // console.log(JSON.parse(localStorage.getItem('workout')));
    const data = JSON.parse(localStorage.getItem("worko"));
    if (!data) return;
    this.#workouts = data;
    this.#workouts.forEach(work => {
      this._renderWorkout(work);
    });
  }
}
const app = new App();
// app._getPosition();
