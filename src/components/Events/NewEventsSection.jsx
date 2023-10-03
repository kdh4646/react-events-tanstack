import { useQuery } from "@tanstack/react-query";

import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import EventItem from "./EventItem.jsx";

import { fetchEvents } from "../../util/http.js";

export default function NewEventsSection() {
  //tanstack hook
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", { max: 3 }],

    //setting request                                        below indicates {max: 3}
    queryFn: ({ signal, queryKey }) => fetchEvents({ signal, ...queryKey[1] }),

    /*
      For prohibiting unnecessary request
      wait time till get cache data and do another request
    */
    staleTime: 5000,

    //garbage collect time - control how long data/cache to keep
    //gcTime: 1000,
  });

  let content;

  //check loading(pending)
  if (isPending) {
    content = <LoadingIndicator />;
  }

  //check error
  if (isError) {
    content = (
      <ErrorBlock
        title="An error occurred"
        message={error.info?.message || "Failed to fetch events."}
      />
    );
  }

  if (data) {
    content = (
      <ul className="events-list">
        {data.map((event) => (
          <li key={event.id}>
            <EventItem event={event} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="content-section" id="new-events-section">
      <header>
        <h2>Recently added events</h2>
      </header>
      {content}
    </section>
  );
}
