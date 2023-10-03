import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { fetchEvent, updateEvent, queryClient } from "../../util/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";

export default function EditEvent() {
  const navigate = useNavigate();
  const params = useParams();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ id: params.id, signal }),
  });

  //Optimistic update & Rollback
  const { mutate } = useMutation({
    mutationFn: updateEvent,

    //optimistic update: execute when mutate() calls
    onMutate: async (data) => {
      const newEvent = data.event; //event: formData from mutate()

      //cancel ongoing queries before next step occurs
      await queryClient.cancelQueries({ queryKey: ["events", params.id] });

      //get previous data for Rollback
      const previousEvent = queryClient.getQueryData(["events", params.id]);

      //two argumetns needed: key, new Data
      queryClient.setQueryData(["events", params.id], newEvent);

      //onError's context
      return { previousEvent };
    },

    //if have an error
    onError: (error, data, context) => {
      queryClient.setQueryData(["events", params.id], content.previousEvent);
    },

    //execute on every mutate call (no matter failed or succeed)
    onSettled: () => {
      //to know whether data is latest one.
      queryClient.invalidateQueries(["events", params.id]);
    },
  });

  function handleSubmit(formData) {
    mutate({ id: params.id, event: formData });
    navigate("../");
  }

  function handleClose() {
    navigate("../");
  }

  let content;

  if (isPending) {
    content = (
      <div className="center">
        <LoadingIndicator />
      </div>
    );
  }

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
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}
