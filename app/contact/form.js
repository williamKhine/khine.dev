import FormLabel from "./form-label";
import FormInput from "./form-input";
import FormTextArea from "./form-text-area";

import handleFormSubmit from "@/app/handleFormSubmit"

export default function Form() {

  return (
    <form id="contact" action={handleFormSubmit} className="mx-auto flex sm:w-3/4 w-full flex-col">
      <FormLabel htmlFor="firstname">First name</FormLabel>
      <FormInput name="firstname" type="text" />

      <FormLabel htmlFor="lastname">Last name</FormLabel>
      <FormInput name="lastname" type="text" />

      <FormLabel htmlFor="email">Email</FormLabel>
      <FormInput name="email" type="email" />

      <FormLabel htmlFor="subject">Subject</FormLabel>
      <FormInput name="subject" type="text" />

      <FormLabel htmlFor="message">Message</FormLabel>
      <FormTextArea name="message" />
      <button type="submit">Submit</button>
    </form>
  );
}
