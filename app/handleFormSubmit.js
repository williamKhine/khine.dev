"use server"
import MailService from "@sendgrid/mail"

MailService.setApiKey(process.env.SENDGRID_API_KEY)

const verifiedSender = {
    email: 'william@khine.dev',
    name: 'William Khine'
}

export default async function handleFormSubmit(data) {
    console.log(data)
}
