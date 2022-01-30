const Ratings = (opts: { score: number }) => {
  const { score } = opts;
  if (isNaN(score) || !score || score < 0 || score > 5) return <div></div>;
  const rounded = Math.round(score);
  const remainingScore = 5 - rounded;
  const ratingsArray = Array(rounded)
    .fill(true)
    .concat(Array(remainingScore).fill(false));
  const ratingStart = () =>
    ratingsArray.map((starred, index) => (
      <div key={index}>
        <svg
          className={`w-6 h-6 ${starred ? "text-yellow-300" : "text-white"}`}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10.386 1.69075C10.686 0.76975 11.989 0.76975 12.288 1.69075L13.807 6.36475C13.8724 6.56524 13.9995 6.73993 14.1701 6.86385C14.3407 6.98778 14.5461 7.0546 14.757 7.05475H19.672C20.641 7.05475 21.043 8.29475 20.26 8.86475L16.284 11.7528C16.1132 11.8769 15.9861 12.052 15.9209 12.2528C15.8557 12.4536 15.8557 12.6699 15.921 12.8708L17.439 17.5448C17.739 18.4668 16.684 19.2328 15.901 18.6628L11.925 15.7747C11.7541 15.6505 11.5483 15.5836 11.337 15.5836C11.1257 15.5836 10.9199 15.6505 10.749 15.7747L6.77301 18.6628C5.99001 19.2328 4.93501 18.4658 5.23501 17.5448L6.75301 12.8708C6.81829 12.6699 6.81833 12.4536 6.75312 12.2528C6.68791 12.052 6.5608 11.8769 6.39001 11.7528L2.41401 8.86475C1.63001 8.29475 2.03401 7.05475 3.00201 7.05475H7.91601C8.12706 7.05481 8.33271 6.98809 8.50353 6.86415C8.67435 6.74021 8.80158 6.5654 8.86701 6.36475L10.386 1.69075V1.69075Z"
            fill="currentColor"
            stroke="black"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ));
  return (
    <div className="flex items-center p-2 space-x-2">
      <div className="flex">{ratingStart()}</div>
      <p className="text-lg font-bold">{score}</p>
    </div>
  );
};

export default Ratings;
