import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import Button from "../components/Button/Button";
import ErrorMessage from "../components/ErrorMessage";
import Input from "../components/Input/Input";
import Modal from "../components/Modal";
import SelectComponent from "../components/Select/SelectComponent";
import { useSendVerificationCode } from "../hooks/useSendVerificationCode";
import useUserIdCheck from "../hooks/useUserIdCheck";
import { useVerifyEmailCode } from "../hooks/useVerifyEmailCode";
import "../style/FreelancerSignupForm.css";

const countryCodes = [
  { value: "+82", label: "한국 (+82)" },
  { value: "+1", label: "미국/캐나다 (+1)" },
  { value: "+81", label: "일본 (+81)" },
  { value: "+86", label: "중국 (+86)" },
  { value: "+44", label: "영국 (+44)" },
];

const countries = [
  { value: "kr", label: "한국" },
  { value: "us", label: "미국" },
];

interface EmployerSignupFormInputs {
  userId: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  mobile: string;
  country: string;
  language: string;
  agreeToTerms: boolean;
  verificationCode?: string;
}

const EmployerSignupForm = () => {
  const [selectedCountryCodes, setSelectedCountryCodes] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // const { control, handleSubmit, watch } = useForm<EmployerSignupFormInputs>();
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EmployerSignupFormInputs>({
    mode: "onChange", // or 'onBlur'
  });

  // 유저 ID 중복 확인
  const {
    mutate: checkUserId,
    status: checkUserIdStatus,
    isError: isCheckUserIdError,
    error: checkUserIdError,
    data: isValidId,
  } = useUserIdCheck();

  // const isLoading = status === "pending";
  const isCheckUserIdLoading = checkUserIdStatus === "pending";

  // 이메일 인증 코드 발송 상태
  const {
    mutate: sendVerificationCode,
    isSuccess: isSendVerificationSuccess,
    status: verificationStatus,
    // status: isSendVerificationLoading, // 'loading' | 'idle' | 'success' | 'error'
    // isError: isSendVerificationError,
    // error: sendVerificationError,
    data: isEmailVerified,
  } = useSendVerificationCode();

  const [timer, setTimer] = useState(300); // 5분 타이머

  const isSendVerificationLoading = verificationStatus === "pending";

  // 이메일 인증 코드 일치 확인 상태
  const {
    mutate: verifyEmailCode,
    status: verifyEmailCodeStatus,
    // isError: dd,
    // error: dd,
    data: isEmailCodeVerified,
  } = useVerifyEmailCode();

  const isCodeVerified = Boolean(isEmailCodeVerified);
  const isVerifyEmailCodeLoading = verifyEmailCodeStatus === "pending";
  console.log("isVerifyEmailCodeLoading:", isVerifyEmailCodeLoading);

  // 렌더링 후 실행
  useEffect(() => {
    // console.log("EmployerSignupForm rendered");
    // console.log("isSendVerificationSuccess:", isSendVerificationSuccess);
    let interval: ReturnType<typeof setInterval>;
    if (isSendVerificationSuccess) {
      interval = setInterval(() => {
        setTimer((oldTimer) => {
          if (oldTimer === 0) {
            clearInterval(interval);
            return 0;
          }
          return oldTimer - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSendVerificationSuccess]);

  // 이메일 인증 코드 확인
  const handleSendVerificationCode = (e: React.MouseEvent<HTMLElement>) => {
    // 이메일 인증 코드 확인 요청 보내기
    // 백엔드 API 호출이 성공적이면 타이머 시작
    // 발송 요청이 실패하면 에러 메시지 표시
    e.preventDefault();
    const email = watch("email");
    console.log(`Email: ${email}`);

    sendVerificationCode(email);

    // 성공했다는 여부를 어디서 꺼내어 쓸 수 있지?

    // 인증 절차는 어떻게 구성할 것인지?
    // 바로 아래 div 를 하나 만들어고 인증 코드 입력창과 확인 버튼을 만들어야 함
    // 그리고 시간이 카운트 다운 되면서 인증 코드를 입력할 수 있게 해야 함
  };

  // 시간 포맷팅 함수
  function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  }

  // 이메일 인증 코드 확인 버튼 클릭 시
  const handleVerifyEmailCode = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    const email = watch("email");
    const verificationCode = watch("verificationCode");
    console.log(`Verification code: ${verificationCode}`);
    // 타이머를 멈추고 인증 코드를 확인하는 API 호출
    // 인증 코드가 일치하면 인증된 이메일로 표시
    // 인증 코드가 일치하지 않으면 에러 메시지 표시
    // 유효성 검사: 이메일과 인증 코드가 모두 존재하는지 확인
    if (!email || !verificationCode) {
      console.error("Email and verification code are required.");
      return; // email 또는 verificationCode가 없다면 함수를 여기서 종료
    }

    // 타이머를 멈추고 인증 코드를 확인하는 API 호출
    verifyEmailCode({ email, token: Number(verificationCode) });

    // 타이머 초기화
    setTimer(0);
  };

  // 이메일 인증 코드 재전송
  const handleResendVerifyEmailCode = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    const email = watch("email");
    console.log(`Resending verification code to ${email}`);
    sendVerificationCode(email);
    setTimer(300);
  };

  const handleUserIdCheck = (e: React.MouseEvent) => {
    e.preventDefault();
    const userId = watch("userId");
    if (!userId) {
      alert("Please enter your user ID.");
      return;
    }
    checkUserId(userId);
  };

  const handleChangeCountryCode = (value: string) => {
    setSelectedCountryCodes(value);
    console.log(`Selected: ${value}`);
  };

  const handleChangeCountry = (value: string) => {
    setSelectedCountryCodes(value);
    console.log(`Selected: ${value}`);
  };

  const handleChangeLanguage = (value: string) => {
    setSelectedCountryCodes(value);
    console.log(`Selected: ${value}`);
  };

  const openModal = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  // 폼 제출
  const onSubmit: SubmitHandler<EmployerSignupFormInputs> = (data) => {
    console.log(data);
  };

  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="signup__container">
      <h3>회원 가입하고 모집 등록을 완료하세요!</h3>
      <form className="signup__form" onSubmit={handleSubmit(onSubmit)}>
        {/* 아이디 */}
        <label htmlFor="User ID">User ID</label>
        <div className="signup__form__id-group group">
          <Controller
            name="userId"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Input type="text" placeholder="Create a user ID." {...field} />
            )}
          />
          <Button
            size={"sm"}
            variant={
              isCheckUserIdLoading
                ? "primary"
                : isValidId !== undefined
                ? isValidId
                  ? "secondary" // 'secondary'는 유효한 ID
                  : "tertiary" // 'tertiary'는 유효하지 않은 ID
                : "primary" // isLoading이나 isValidId가 undefined일 때 기본값
            }
            onClick={handleUserIdCheck}
            disabled={isCheckUserIdLoading || !watch("userId")}
          >
            {isCheckUserIdLoading ? "Checking..." : "Verify"}
          </Button>
          <div
            className={`signup__form__id-group__message ${
              isValidId ? "" : "invalid"
            }`}
          >
            {isCheckUserIdError && (
              <p>Error checking ID: {checkUserIdError.message}</p>
            )}
            {isValidId !== undefined && (
              <span>ID is {isValidId ? "valid" : "invalid"}</span>
            )}
          </div>
        </div>
        {/* 비밀번호 */}
        <label htmlFor="Password">Password</label>
        <Controller
          name="password"
          control={control}
          rules={{
            required: true,
            minLength: {
              value: 12,
              message: "Password must be at least 12 characters long.",
            },
            pattern: {
              value:
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/,
              message:
                "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.",
            },
          }}
          render={({ field, fieldState }) => (
            <>
              <Input
                type="password"
                placeholder="Create your password."
                {...field}
              />
              {fieldState.error && (
                <ErrorMessage message={fieldState.error.message} />
              )}
            </>
          )}
        />

        {/* 비밀번호 확인 */}
        <Controller
          name="confirmPassword"
          control={control}
          rules={{
            required: true,
            validate: (value) =>
              value === watch("password") || "Passwords do not match.",
          }}
          render={({ field, fieldState }) => (
            <>
              <Input
                type="password"
                placeholder="Confirm your password."
                {...field}
              />
              {fieldState.error && (
                <ErrorMessage message={fieldState.error.message} />
              )}
            </>
          )}
        />
        {/* 이름 */}
        <label htmlFor="Full Name">Full Name</label>
        <div className="signup__form__name-group group">
          <Input
            type="text"
            placeholder="Enter your first name."
            {...register("firstName", {
              required: true,
            })}
          />
          <Input
            type="text"
            placeholder="Enter your last name."
            {...register("lastName", {
              required: true,
            })}
          />
        </div>
        {/* 회사 */}
        <label htmlFor="Company">Company</label>
        <Input
          type="text"
          placeholder="Enter your company name."
          {...register("company", {
            required: true,
          })}
        />
        {/* 이메일 */}
        <label htmlFor="Email">Email</label>
        <div className="signup__form__email-group group">
          <Controller
            name="email"
            control={control}
            rules={{
              required: "Email address is required",
              pattern: {
                value:
                  /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i,
                message: "이메일 형식에 맞지 않습니다.",
              },
            }}
            render={({ field }) => (
              <Input
                type="text"
                placeholder="Enter your email address."
                {...field}
              />
            )}
          />
          <Button
            size={"sm"}
            variant={
              isSendVerificationLoading
                ? "primary"
                : isEmailVerified !== undefined
                ? isEmailVerified
                  ? "secondary" // 'secondary'는 인증된 이메일
                  : "tertiary" // 'tertiary'는 인증되지 않은 이메일
                : "primary" // 기본값
            }
            onClick={handleSendVerificationCode}
            disabled={isSendVerificationLoading || !watch("email")}
          >
            {isSendVerificationLoading
              ? "Sending..."
              : "Send Verification Code"}
          </Button>
        </div>
        {/* 이메일 인증 */}
        {isSendVerificationSuccess && (
          <div className="signup__form__email-group group">
            {/* 인증번호 입력 필드 */}
            <Controller
              name="verificationCode"
              control={control}
              rules={{
                required: "인증번호를 입력해주세요.",
                pattern: {
                  value: /^[0-9]{6}$/,
                  message: "인증번호는 6자리 숫자입니다.",
                },
              }}
              render={({ field, fieldState }) => (
                <div className="">
                  <Input
                    type="text"
                    placeholder="Enter the verification code."
                    disabled={isCodeVerified}
                    {...field}
                  />
                  {fieldState.error && (
                    <ErrorMessage message={fieldState.error.message} />
                  )}
                </div>
              )}
            />
            {/* 타이머 표시 */}
            <p>{formatTime(timer)} seconds remaining</p>
            {/* 조건부 렌더링: 타이머가 0이고 인증이 완료되지 않은 경우 재전송 버튼 표시 */}
            {timer === 0 && !isEmailCodeVerified ? (
              <Button
                size={"sm"}
                variant="primary"
                onClick={handleResendVerifyEmailCode}
              >
                Resend Verification Code
              </Button>
            ) : (
              <Button
                size={"sm"}
                variant={isEmailCodeVerified ? "secondary" : "primary"}
                onClick={handleVerifyEmailCode}
                disabled={isCodeVerified || timer === 0}
              >
                {isEmailCodeVerified ? "Verified" : "Verify"}
              </Button>
            )}
          </div>
        )}
        {/* 전화번호 */}
        <label htmlFor="Mobile">Mobile</label>
        <div className="signup__form__phone-group group">
          <SelectComponent
            label=""
            options={countryCodes}
            selected={selectedCountryCodes}
            onChange={handleChangeCountryCode}
          />
          <Input type="text" placeholder="Enter your mobile number." />
          <Button size={"sm"} variant={"primary"}>
            Verify
          </Button>
        </div>
        {/* 국가 */}
        <label htmlFor="Country">Country</label>
        <SelectComponent
          label=""
          options={countries}
          selected={selectedCountryCodes}
          onChange={handleChangeCountry}
        />
        {/* 사용언어 */}
        <label htmlFor="Language">Language</label>
        <SelectComponent
          label=""
          options={countries}
          selected={selectedCountryCodes}
          onChange={handleChangeLanguage}
        />
        {/* 약관 */}
        <label className="checkbox-label">
          <input type="checkbox" />
          <span className="agreement-text">
            I agree to the 플라잉 피그
            <span className="text-block">
              <a onClick={openModal}>User Agreement</a> and
              <a onClick={openModal}>Privacy Policy.</a>
            </span>
          </span>
        </label>

        <Button size={"lg"} variant={"primary"}>
          Join
        </Button>
        <span className="signup__form__login">
          Already have an account? <a href="/login">Log in</a>
        </span>
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <h1>Modal Content</h1>
        </Modal>
      </form>
    </div>
  );
};

export default EmployerSignupForm;

/*

  | "primary"
  | "secondary"
  | "tertiary"
  | "outlinePrimary"
  | "outlineSecondary"
  | "outlineTertiary";

  */
