import React, { useState } from "react";
import styles from "../../../styles/NewSchool.module.scss";
import Head from "next/head";
import ContentCard from "../../../components/ContentCard";
import SchoolIcon from "@mui/icons-material/School";
import CorporateFareIcon from "@mui/icons-material/CorporateFare";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import MapsHomeWorkIcon from "@mui/icons-material/MapsHomeWork";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DescriptionIcon from "@mui/icons-material/Description";
import StepConnector, {
  stepConnectorClasses,
} from "@mui/material/StepConnector";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import FormHelperText from "@mui/material/FormHelperText";
import Fade from "@mui/material/Fade";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { provinces } from "../../../utils/validateProvince";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useRouter } from "next/router";

export default function NewSchool() {
  const steps = ["Basic Info", "School Type", "Location", "Review"];
  const [activeStep, setActiveStep] = useState(0);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [schoolType, setSchoolType] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [nameError, setNameError] = useState(false);
  const [schoolTypeError, setSchoolTypeError] = useState(false);
  const [cityError, setCityError] = useState(false);
  const [provinceError, setProvinceError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastError, setToastError] = useState(false);
  const [toastSuccess, setToastSuccess] = useState(false);

  const router = useRouter();

  function handleBack() {
    if (activeStep === 0) return;
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  }

  function handleNext(e) {
    e.preventDefault();
    if (activeStep === steps.length - 1) {
      handleSubmit();
      return;
    }

    let isError = false;
    switch (activeStep) {
      case 0:
        isError = handleBasicInfo();
        break;
      case 1:
        isError = handleSchoolType();
        break;
      case 2:
        isError = handleLocation();
        break;
      default:
        break;
    }

    if (!isError) {
      setNameError(false);
      setSchoolTypeError(false);
      setCityError(false);
      setProvinceError(false);
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  }

  async function handleSubmit() {
    setIsSubmitting(true);

    const response = await fetch("/api/schools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: name,
        description: description,
        type: schoolType,
        city: city,
        province: province,
      }),
    });

    const json = await response.json();

    if (json.code !== 201) {
      setIsSubmitting(false);
      setToastError(json.message);
      return;
    } else {
      setToastSuccess(true);

      setTimeout(() => {
        router.push(`/schools?query=${name}`);
      }, 3000);
    }
  }

  function handleBasicInfo() {
    if (!name || name.length > 100) {
      setNameError(true);
      return true;
    }
  }
  function handleSchoolType() {
    if (!schoolType) {
      setSchoolTypeError(true);
      return true;
    }
  }
  function handleLocation() {
    if (!city || city.length > 35) {
      setCityError(true);
      return true;
    }
    if (!province) {
      setProvinceError(true);
      return true;
    }
  }

  const basicInfo = (
    <Fade
      in={activeStep === 0}
      style={{ transitionDelay: "100ms", transitionDuration: "0.4s" }}
    >
      <div className={styles.form}>
        <h2>Simple School Stuff</h2>
        <FormControl
          sx={{ m: 2, width: "300px" }}
          variant="outlined"
          required
          error={nameError}
        >
          <InputLabel htmlFor="name">School Name</InputLabel>
          <OutlinedInput
            id="name"
            name="name"
            type="text"
            placeholder="Every school has a name"
            label="School Name"
            value={name}
            autoComplete="off"
            onChange={(e) => setName(e.target.value)}
          />
          <FormHelperText>1-100 characters long</FormHelperText>
        </FormControl>

        <FormControl sx={{ m: 2, width: "300px" }} variant="outlined">
          <InputLabel htmlFor="description">Description</InputLabel>
          <OutlinedInput
            id="description"
            name="description"
            type="text"
            placeholder={`What's the school like? 
Strengths? Notorieties?`}
            label="Description"
            multiline
            rows={5}
            value={description}
            autoComplete="off"
            onChange={(e) => setDescription(e.target.value)}
          />
        </FormControl>
      </div>
    </Fade>
  );

  const type = (
    <Fade
      in={activeStep === 1}
      style={{ transitionDelay: "100ms", transitionDuration: "0.4s" }}
    >
      <div className={styles.type_container}>
        <h2>What Type?</h2>
        <div className={styles.types}>
          <div
            className={styles.type}
            onClick={() => setSchoolType("U")}
            style={{
              color: schoolType === "U" ? "rgb(255, 77, 77)" : "gray",
              border:
                schoolType === "U"
                  ? "1px solid rgb(255, 77, 77)"
                  : "1px solid gray",
            }}
          >
            <SchoolIcon sx={{ color: "inherit" }} className={styles.icon} />
            <h2 style={{ color: "inherit", margin: 0 }}>University</h2>
          </div>

          <div
            className={styles.type}
            onClick={() => setSchoolType("C")}
            style={{
              color: schoolType === "C" ? "rgb(255, 77, 77)" : "gray",
              border:
                schoolType === "C"
                  ? "1px solid rgb(255, 77, 77)"
                  : "1px solid gray",
            }}
          >
            <CorporateFareIcon
              sx={{ color: "inherit" }}
              className={styles.icon}
            />
            <h2 style={{ color: "inherit", margin: 0 }}>College</h2>
          </div>
        </div>
        <FormHelperText error={schoolTypeError}>* Required</FormHelperText>
      </div>
    </Fade>
  );

  const location = (
    <Fade
      in={activeStep === 2}
      style={{ transitionDelay: "100ms", transitionDuration: "0.4s" }}
    >
      <div className={styles.form}>
        <h2>Almost Done...</h2>
        <FormControl
          sx={{ m: 2, width: "300px" }}
          variant="outlined"
          required
          error={cityError}
        >
          <InputLabel htmlFor="city">City</InputLabel>
          <OutlinedInput
            id="city"
            name="city"
            type="text"
            placeholder="Where is this school?"
            label="City"
            value={city}
            autoComplete="off"
            onChange={(e) => setCity(e.target.value)}
          />
          <FormHelperText>1-35 characters long</FormHelperText>
        </FormControl>

        <Autocomplete
          id="province"
          options={provinces}
          sx={{ m: 2, width: "300px" }}
          value={province}
          onChange={(e, newValue) => setProvince(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Province"
              name="province"
              required
              autoComplete="off"
              error={provinceError}
              placeholder="Where, but a bit more broad"
            />
          )}
        />
      </div>
    </Fade>
  );

  const summary = (
    <Fade
      in={activeStep === 3}
      style={{ transitionDelay: "100ms", transitionDuration: "0.4s" }}
    >
      <div className={styles.form}>
        <h2>Review Your Details: </h2>

        <FormControl
          sx={{ m: 2, width: "300px" }}
          variant="outlined"
          required
          error={nameError}
        >
          <InputLabel htmlFor="name">Name</InputLabel>
          <OutlinedInput
            id="name"
            name="name"
            type="text"
            placeholder="Every school has a name"
            label="Name"
            value={name}
            readOnly
          />
        </FormControl>

        <FormControl sx={{ m: 2, width: "300px" }} variant="outlined">
          <InputLabel htmlFor="description">Description</InputLabel>
          <OutlinedInput
            id="description"
            name="description"
            type="text"
            placeholder="(Optional)"
            label="Password"
            multiline
            rows={5}
            value={description}
            readOnly
          />
        </FormControl>

        <FormControl
          sx={{ m: 2, width: "300px" }}
          variant="outlined"
          required
          error={schoolTypeError}
        >
          <InputLabel htmlFor="type">Type</InputLabel>
          <OutlinedInput
            id="type"
            name="type"
            type="text"
            placeholder="School type"
            label="Type"
            value={type === "U" ? "University" : "College"}
            readOnly
          />
        </FormControl>

        <FormControl
          sx={{ m: 2, width: "300px" }}
          variant="outlined"
          required
          error={cityError}
        >
          <InputLabel htmlFor="city">City</InputLabel>
          <OutlinedInput
            id="city"
            name="city"
            type="text"
            placeholder="Where is this school?"
            label="City"
            value={city}
            readOnly
          />
        </FormControl>

        <Autocomplete
          id="province"
          options={provinces}
          sx={{ m: 2, width: "300px" }}
          value={province}
          readOnly
          renderInput={(params) => (
            <TextField
              {...params}
              label="Province"
              name="province"
              required
              error={provinceError}
              placeholder="Where, but a bit more broad"
            />
          )}
        />
      </div>
    </Fade>
  );

  function handleCloseError(e, reason) {
    if (reason === "clickaway") {
      return;
    }
    setToastError(false);
  }

  function handleCloseSuccess(e, reason) {
    if (reason === "clickaway") {
      return;
    }
    setToastSuccess(false);
  }

  return (
    <>
      <Head>
        <title>New School | UniSpaces</title>
      </Head>

      <div className={styles.content}>
        <ContentCard style={{ marginBottom: "30px" }}>
          <div className={styles.banner}>
            <SchoolIcon sx={{ fontSize: 80, color: "gray" }} />
            <h1 className={styles.title}>Add a School</h1>
          </div>

          <div className={styles.stepper}>
            <Stepper
              activeStep={activeStep}
              alternativeLabel
              connector={<ColorStepConnector />}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel StepIconComponent={ColorStepIcon}>
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </div>
        </ContentCard>

        <ContentCard>
          <form onSubmit={handleNext}>
            {activeStep === 0 && basicInfo}
            {activeStep === 1 && type}
            {activeStep === 2 && location}
            {activeStep === 3 && summary}
            <div className={styles.back_next}>
              <Button
                disabled={activeStep === 0 || isSubmitting}
                onClick={handleBack}
              >
                Back
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {activeStep === steps.length - 1 ? "Finish" : "Next"}
              </Button>
            </div>
          </form>
        </ContentCard>
      </div>

      <Snackbar
        open={toastError}
        autoHideDuration={5000}
        onClose={handleCloseError}
      >
        <Alert severity="error" onClose={handleCloseError}>
          {toastError}
        </Alert>
      </Snackbar>

      <Snackbar
        open={toastSuccess}
        autoHideDuration={5000}
        onClose={handleCloseSuccess}
      >
        <Alert severity="success" onClose={handleCloseSuccess}>
          Looks good! Your new school was added. Redirecting...
        </Alert>
      </Snackbar>
    </>
  );
}

const ColorStepConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 19,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      // backgroundImage:
      //   "linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)",
      backgroundColor: "rgb(255, 77, 77)",
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      // backgroundImage:
      //   "linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)",
      backgroundColor: "rgb(255, 77, 77)",
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor:
      theme.palette.mode === "dark" ? theme.palette.grey[800] : "#eaeaf0",
    borderRadius: 1,
  },
}));

const ColorStepIconRoot = styled("div")(({ theme, ownerState }) => ({
  backgroundColor:
    theme.palette.mode === "dark" ? theme.palette.grey[700] : "#ccc",
  zIndex: 1,
  color: "#fff",
  width: 40,
  height: 40,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  ...(ownerState.active && {
    // backgroundImage:
    //   "linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)",
    // boxShadow: "0 4px 10px 0 rgba(0,0,0,.25)",
    backgroundColor: "rgb(255, 77, 77)",
  }),
  ...(ownerState.completed && {
    // backgroundImage:
    //   "linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)",
    backgroundColor: "rgb(255, 77, 77)",
  }),
}));

function ColorStepIcon({ active, completed, icon }) {
  const icons = {
    1: <EditIcon />,
    2: <MapsHomeWorkIcon />,
    3: <LocationOnIcon />,
    4: <DescriptionIcon />,
  };

  return (
    <ColorStepIconRoot ownerState={{ completed, active }}>
      {icons[String(icon)]}
    </ColorStepIconRoot>
  );
}
