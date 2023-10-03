import {
  Link,
  redirect,
  useNavigate,
  useNavigation,
  useParams,
  useSubmit,
} from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { fetchEvent, updateEvent, queryClient } from "../../util/http.js";

export default function EditEvent() {
  const navigate = useNavigate();
  const params = useParams();

  //1. using react router
  const { state } = useNavigation();
  const submit = useSubmit();

  //2. using tanstack
  const { data, isError, error } = useQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ id: params.id, signal }),
    staleTime: 10000,
  });

  // //Optimistic update & Rollback
  // const { mutate } = useMutation({
  //   mutationFn: updateEvent,

  //   //optimistic update: execute when mutate() calls
  //   onMutate: async (data) => {
  //     const newEvent = data.event; //event: formData from mutate()

  //     //cancel ongoing queries before next step occurs
  //     await queryClient.cancelQueries({ queryKey: ["events", params.id] });

  //     //get previous data for Rollback
  //     const previousEvent = queryClient.getQueryData(["events", params.id]);

  //     //two argumetns needed: key, new Data
  //     queryClient.setQueryData(["events", params.id], newEvent);

  //     //onError's context
  //     return { previousEvent };
  //   },

  //   //if have an error
  //   onError: (error, data, context) => {
  //     queryClient.setQueryData(["events", params.id], content.previousEvent);
  //   },

  //   //execute on every mutate call (no matter failed or succeed)
  //   onSettled: () => {
  //     //to know whether data is latest one.
  //     queryClient.invalidateQueries(["events", params.id]);
  //   },
  // });

  function handleSubmit(formData) {
    // mutate({ id: params.id, event: formData });
    // navigate("../");

    submit(formData, { method: "PUT" });
  }

  function handleClose() {
    navigate("../");
  }

  let content;

  if (isError) {
    content = (
      <>
        <ErrorBlock
          title="Failed to load event"
          message={
            error.info?.message ||
            "Failed to load event. Please check your inputs and try again later."
          }
        />
        <div className="form-actions">
          <Link to="../" className="button">
            {" "}
            Okay
          </Link>
        </div>
      </>
    );
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        {state === "submitting" ? (
          <p>Sending data...</p>
        ) : (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Update
            </button>
          </>
        )}
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}

export function loader({ params }) {
  return queryClient.fetchQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ id: params.id, signal }),
  });
}

export async function action({ request, params }) {
  const formData = await request.formData();

  //convert formData to simple key-value pair object
  const updatedEventData = Object.fromEntries(formData);

  await updateEvent({ id: params.id, event: updatedEventData });
  await queryClient.invalidateQueries(["events"]);

  return redirect("../");
}
