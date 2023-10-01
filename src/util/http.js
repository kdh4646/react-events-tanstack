export async function fetchEvents() {
  setIsLoading(true);
  const response = await fetch("http://localhost:3000/events");

  if (!response.ok) {
    const error = new Error("An error occurred while fetching the events");
    error.code = response.status;
    error.info = await response.json();

    //for useQuery() isError
    throw error;
  }

  const { events } = await response.json();

  return events;
}