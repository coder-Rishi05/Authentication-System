export const geneRateOtp = () => {
  let otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
};

export const getOptHtml = (otp) => {
  return `
        Yout Otp is ${otp}
    `;
};
