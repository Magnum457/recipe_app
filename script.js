const mealsEl = document.getElementById('meals');
const favMealsEl = document.getElementById('fav-meals')

const searchTermEl = document.getElementById('search-term');
const searchBtnEl = document.getElementById('search');

const mealPopupEl = document.getElementById('meal-popup');
const mealInfoEl = document.getElementById('meal-info');
const popupCloseBtnEl = document.getElementById('close-popup');

getRandomMeal();
fetchFavMeals();

async function getRandomMeal() {
  const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
  const respJson = await response.json();
  const randomMeal = respJson.meals[0];

  addMeal(randomMeal, true);
}

async function getMealById(id) {
  const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
  const respJson = await response.json();
  const mealById = respJson.meals[0];

  return mealById;
}

async function getMealsBySearch(term) {
  const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${term}`);
  const respJson = await response.json();
  const mealsBySearch = respJson.meals;
  
  return mealsBySearch;
}


function addMeal(mealData, random = false) {
  const meal = document.createElement('div');
  meal.classList.add('meal');

  meal.innerHTML = `
  <div class="meal-header">
    ${random ? `
        <span class="random">
          Random Recipe
        </span>
      ` : `

      `}
    <img 
      src="${mealData.strMealThumb}" 
      alt="${mealData.strMeal}"
    >
  </div>
  <div class="meal-body">
    <h4>${mealData.strMeal}</h4>
    <button class="fav-btn">
      <i class="fas fa-heart"></i>
    </button>
  </div>
  `;

  meal.addEventListener('click', () => {
    showMealInfo(mealData);
  });

  const btn = meal.querySelector('.meal-body .fav-btn')
  btn.addEventListener('click', () => {
    if(btn.classList.contains('active')) {
      removeMealFromLocalStorage(mealData.idMeal);
      btn.classList.remove('active');
    } else {
      addMealsToLocalStorage(mealData.idMeal);
      btn.classList.add('active');
    }

    fetchFavMeals();
  });

  mealsEl.appendChild(meal);
}

function addMealToFav(mealData) {
  const favMeal = document.createElement('li');

  favMeal.innerHTML = `
    <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
    <span>${mealData.strMeal}</span>
    <button class="clear"><i class="fas fa-window-close"></i></button>
  `;

  favMeal.addEventListener('click', async () => {
    showMealInfo(mealData);
  });

  const btn = favMeal.querySelector(".clear");
  btn.addEventListener('click', () => {
    removeMealFromLocalStorage(mealData.idMeal);

    fetchFavMeals();
  });

  favMealsEl.appendChild(favMeal);
}

function addMealsToLocalStorage(mealId) {
  const mealIds = getMealsFromLocalStorage();

  localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId]))
}

function removeMealFromLocalStorage(mealId) {
  const mealIds = getMealsFromLocalStorage();

  localStorage.setItem('mealIds', JSON.stringify(mealIds.filter(id => id !== mealId)));
}

function getMealsFromLocalStorage() {
  const mealIds = JSON.parse(localStorage.getItem('mealIds'));

  return mealIds === null ? [] : mealIds;
}

async function fetchFavMeals() {
  favMealsEl.innerHTML = "";

  const mealIds = getMealsFromLocalStorage();

  for(let i=0; i<mealIds.length; i++) {
    const mealId = mealIds[i];
    let meal = await getMealById(mealId);

    addMealToFav(meal);
  }
}

function showMealInfo(mealData) {
  mealInfoEl.innerHTML = '';

  const mealEl = document.createElement('div');
  
  const ingredients = [];

  for (let i=1; i<=20; i++) {
    if(mealData['strIngredient'+i]) {
      ingredients.push(`${mealData['strIngredient'+i]} - ${mealData['strMeasure'+i]}`);
    } else {
      break;
    }
  }

  mealEl.innerHTML = `
    <h1>${mealData.strMeal}</h1>
    <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
    <p>
      ${mealData.strInstructions}
    </p>
    <h3>Ingredients</h3>
    <ul>
      ${ingredients.map((ing) => `
        <li>${ing}</li>
      `).join("")}
    </ul>
  `

  mealInfoEl.appendChild(mealEl);

  mealPopupEl.classList.remove('hidden');
}

searchBtnEl.addEventListener('click', async () => {
  mealsEl.innerHTML = '';
  
  const search = searchTermEl.value;

  const mealsSearched = await getMealsBySearch(search);
  if (meals) {
    mealsSearched.forEach(meal => {
      addMeal(meal);
    });
  }
});

popupCloseBtnEl.addEventListener('click', () => {
  mealPopupEl.classList.add('hidden');
});
