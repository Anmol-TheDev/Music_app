import { useRouteError } from "react-router-dom";

const ErrorPage = () => {
  const error = useRouteError() as unknown;
  console.error(error);

  let errorMessage = "Something went wrong.";
  let errorStatus: string | number = "";

  if (error && typeof error === "object" && "status" in error) {
    const err = error as { status?: number | string; statusText?: string };
    errorStatus = err.status ?? "";
    if (err.status === 404) {
      errorMessage = "Page Not Found.";
    } else if (err.statusText) {
      errorMessage = err.statusText;
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-darkBg text-darkText">
      <div className="text-center p-8 bg-secondaryBlack rounded-lg shadow-lg border border-darkBorder">
        <h1 className="text-6xl font-bold text-mainAccent">{errorStatus || "Error"}</h1>
        <p className="text-2xl text-darkText mt-4">{errorMessage}</p>
        <p className="text-lg text-gray-400 mt-2">
          We apologize for the inconvenience. Please try again later.
        </p>
        <button
          onClick={() => (window.location.href = "/")}
          className="mt-8 px-6 py-3 bg-mainAccent text-white rounded-md hover:bg-main transition duration-300"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;
