# Share tailored résumés with six-character codes

Each shared portfolio link ends in a case-sensitive, six-character hexadecimal code, which is the entire credential and can be forwarded without a sign-in. William chose the short format knowing its limited code space can be guessed. Each code stays tied to the exact PDF originally shared, and each PDF request requires a valid code so revocation takes effect on future requests.

Each résumé version is for one job application. Codes have no automatic expiration. Revoked codes are permanently retired. An archived résumé version continues to serve its active links and cannot receive new codes. The site rate-limits repeated invalid attempts.

Reserve one code per résumé version before uploading the PDF so William can embed its link in the document. William can generate or enter a code and edit it until publication. Validate against `0–9`, `a–f`, and `A–F`, preserve case, and reject codes already reserved or ever published. If the code changes after upload, require a new PDF before publication. Publishing activates and locks the code.
