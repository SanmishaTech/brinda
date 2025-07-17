import { useEffect, useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  KeySquare,
  Copy,
  ClipboardCopy,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useNavigate } from "react-router-dom";
import { get, post } from "@/services/apiService";
import { appName } from "@/config";
import { LoaderCircle, ChevronsUpDown, Check, UserCheck } from "lucide-react"; // Spinner icon
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import Validate from "@/lib/Handlevalidation";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Search } from "lucide-react";

// Define expected API response structure
interface RegisterResponse {
  message: string;
}

type RegisterFormInputs = z.infer<typeof registerSchema>;

// Define Zod schema
const registerSchema = z.object({
  sponsorId: z.string().min(1, "Sponsor ID is required"),
  name: z
    .string()
    .min(1, "Name cannot be left blank.") // Ensuring minimum length of 2
    .max(100, "Name must not exceed 100 characters.")
    .refine((val) => /^[A-Za-z\s\u0900-\u097F]+$/.test(val), {
      message: "Name can only contain letters.",
    }),
  email: z
    .string()
    .refine(
      (val) =>
        val === "" || val === null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      {
        message: "Email must be a valid email address.",
      }
    )
    .optional(),
  state: z.string().min(1, "State is required"),
  mobile: z
    .string()
    .optional()
    .refine((val) => val === "" || /^\d{10}$/.test(val), {
      message: "Mobile number must be exactly 10 digits.",
    }),
  position: z.string().min(1, "Position is required"),
});

const Register = () => {
  const navigate = useNavigate();
  const [openState, setOpenState] = useState<boolean>(false);
  const [isSponsorLoading, setIsSponsorLoading] = useState(false);
  const [isSponsorVerified, setIsSponsorVerified] = useState(false);
  const MAHARASHTRA = "maharashtra"; // Assuming this is the state you want to set by default
  const [showDialog, setShowDialog] = useState(false);
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [sponsorName, setSponsorName] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const defaultValues = {
    sponsorId: "",
    name: "",
    email: "",
    state: "",
    mobile: "",
    position: "",
  };

  const {
    handleSubmit,
    setError,
    setValue,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues,
  });

  const sponsorId = watch("sponsorId");

  // states
  const { data: states, isLoading: isStatesLoading } = useQuery({
    queryKey: ["states"],
    queryFn: async () => {
      const response = await get(`/states/all`);
      return response;
    },
  });

  useEffect(() => {
    if (states && states.length > 0) {
      // Find Maharashtra by label (or by your exact API property)
      const maharashtraState = states.find(
        (state) => state.label.toLowerCase() === MAHARASHTRA
      );

      if (maharashtraState) {
        setValue("state", maharashtraState.value);
      }
    }
  }, [states, setValue]);

  useEffect(() => {
    setIsSponsorVerified(false);
    setSponsorName(null);
  }, [sponsorId]);

  // sponsor Details
  const sponsorLookupMutation = useMutation({
    mutationFn: async (sponsorId: string) => {
      const response = await get(`/auth/${sponsorId}`);
      return response;
    },
    onSuccess: (data) => {
      if (data?.name) {
        setSponsorName(data.name);
        setIsSponsorVerified(true);

        // toast.success("Sponsor verified!");
      } else {
        setSponsorName(null);
        setIsSponsorVerified(false);

        toast.error("Sponsor has no name or invalid data returned");
      }
    },
    onError: () => {
      setTimeout(() => {
        setSponsorName(null);
        setIsSponsorVerified(false);
      }, 100); // allows exit animation time to start
      toast.error("Invalid Sponsor ID or user not found");
    },
  });

  const isSponsorValid =
    sponsorId.length === 10 && sponsorName && !sponsorLookupMutation.isPending;

  const registerMutation = useMutation<
    RegisterResponse,
    unknown,
    RegisterFormInputs
  >({
    mutationFn: (data) => post("/auth/register", data),
    onSuccess: (data) => {
      toast.success("Registration successful! Please log in.");
      // navigate("/"); // Redirect to login page
      console.log("Registration successful:", data);
      setCredentials({ username: data.username, password: data.password }); // password from form input or returned from backend
      setShowDialog(true);
    },
    onError: (error: any) => {
      Validate(error, setError);
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    },
  });

  const handleCopyDetails = () => {
    const copyText = `Username: ${credentials.username}\nPassword: ${credentials.password}`;
    navigator.clipboard.writeText(copyText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2s
    });
  };

  const onSubmit: SubmitHandler<RegisterFormInputs> = (data) => {
    registerMutation.mutate(data);
  };

  return (
    <form className="p-4 md:p-6 md:pt-2" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col space-y-3">
        <div className="flex flex-col items-center text-center space-y-2">
          <h1 className="text-2xl font-bold">Create an Account</h1>
          <p className="text-balance text-muted-foreground">
            Register for your {appName} Account
          </p>
        </div>
        <div className="flex flex-col space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="sponsorId">Sponsor ID</Label>
            <div className="flex gap-2 items-center">
              <Controller
                name="sponsorId"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="sponsorId"
                    type="text"
                    placeholder="Enter Sponsor ID"
                    disabled={registerMutation.isPending}
                  />
                )}
              />

              <Button
                type="button"
                variant="secondary"
                className="min-w-[110px] flex items-center gap-2"
                onClick={() => {
                  const id = watch("sponsorId");
                  if (id.length !== 10) {
                    toast.error("Sponsor ID must be exactly 10 characters");
                    return;
                  }
                  sponsorLookupMutation.mutate(id);
                }}
              >
                {sponsorLookupMutation.isLoading ? (
                  <LoaderCircle className="w-4 h-4 animate-spin text-blue-600" />
                ) : (
                  <Search className="w-4 h-4 text-blue-600" />
                )}
                <span className="text-sm font-medium">Find</span>
              </Button>
            </div>
            {errors.sponsorId && (
              <span className="text-destructive text-xs">
                {errors.sponsorId.message}
              </span>
            )}
          </div>

          {/* {isSponsorVerified && sponsorName && (
            <div className="flex items-center gap-3 border rounded-lg bg-blue-50 p-4 text-blue-800 shadow-sm animate-fade-in">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                <UserCheck className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-sm font-medium">
                Sponsor Found:{" "}
                <strong className="text-blue-900">{sponsorName}</strong>
              </div>
            </div>
          )} */}
          {/* <AnimatePresence mode="wait">
            {isSponsorVerified && sponsorName && (
              <motion.div
                key={sponsorName} // helps React identify the element
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3 border rounded-lg bg-blue-50 p-4 text-blue-800 shadow-md"
              >
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-sm font-medium">
                  Sponsor Found:{" "}
                  <strong className="text-blue-900">{sponsorName}</strong>
                </div>
              </motion.div>
            )}
          </AnimatePresence> */}
          <AnimatePresence mode="wait">
            {isSponsorVerified && sponsorName && (
              <motion.div
                key={sponsorName}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between border rounded-lg bg-blue-50 p-3 text-blue-800 shadow-md"
              >
                {/* Icon and Sponsor Name at left center */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-blue-900 whitespace-nowrap">
                    {sponsorName}
                  </span>
                </div>

                {/* Heading and Subheading at right center */}
                <div className="text-right">
                  <h4 className="text-xs font-semibold text-blue-900 leading-tight">
                    Sponsor Verified
                  </h4>
                  <p className="text-[10px] text-blue-700 leading-tight">
                    Sponsor details found
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid gap-2 relative">
            <Label htmlFor="name">Name</Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  disabled={registerMutation.isPending}
                  {...field}
                />
              )}
            />

            {errors.name && (
              <span className="text-destructive text-xs absolute -bottom-5">
                {errors.name.message}
              </span>
            )}
          </div>

          <div className="flex gap-4">
            <div className="relative">
              <Label htmlFor="state">State</Label>

              {/* <div className="w-full pt-1"> */}
              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <Popover open={openState} onOpenChange={setOpenState}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openState}
                        className="w-[325px] justify-between mt-1"
                        onClick={() => setOpenState((prev) => !prev)}
                      >
                        {field.value
                          ? states.find((s) => s.value === field.value)?.label
                          : "Select State..."}
                        <ChevronsUpDown className="opacity-50" />
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-[325px] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search state..."
                          className="h-9"
                        />
                        <CommandList>
                          <CommandEmpty>No state found.</CommandEmpty>
                          <CommandGroup>
                            {states?.map((state) => (
                              <CommandItem
                                key={state.value}
                                value={state.value}
                                onSelect={(currentValue) => {
                                  setValue("state", currentValue);
                                  setOpenState(false);
                                }}
                              >
                                {state.label}
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    state.value === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              />

              {/* </div> */}
              {errors.state && (
                <p className="text-destructive text-xs absolute -bottom-5">
                  {errors.state.message}
                </p>
              )}
            </div>
            <div className="grid gap-2 relative">
              <Label htmlFor="position">Position</Label>
              <Controller
                name="position"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    className="flex space-x-4"
                    value={field.value}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id="left" value="Left" />
                      <Label htmlFor="left">Left</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id="right" value="Right" />
                      <Label htmlFor="right">Right</Label>
                    </div>
                  </RadioGroup>
                )}
              />
              {errors.position && (
                <p className="text-destructive text-xs absolute -bottom-5">
                  {errors.position.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1 grid gap-2 relative">
              <Label htmlFor="email">Email</Label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    disabled={registerMutation.isPending}
                    {...field}
                  />
                )}
              />

              {errors.email && (
                <p className="text-destructive text-xs absolute -bottom-5">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="flex-1 grid gap-2 relative">
              <Label htmlFor="mobile">Mobile</Label>
              <Controller
                name="mobile"
                control={control}
                render={({ field }) => (
                  <Input
                    id="mobile"
                    maxLength={10}
                    placeholder="Enter mobile number"
                    disabled={registerMutation.isPending}
                    {...field}
                  />
                )}
              />

              {errors.mobile && (
                <p className="text-destructive text-xs absolute -bottom-5">
                  {errors.mobile.message}
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={registerMutation.isPending || !sponsorName}
          >
            {registerMutation.isPending ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              "Register"
            )}
          </Button>
          <div className="text-center text-sm">
            Already have an account?{" "}
            <a href="/" className="underline underline-offset-4">
              Login
            </a>
          </div>
        </div>
        {/* AlertDialog for credentials */}
        {/* <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
          <AlertDialogTrigger />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Registration Successful</AlertDialogTitle>
              <AlertDialogDescription>
                Your account has been created successfully. <br />
                <strong>Username:</strong> {credentials.username} <br />
                <strong>Password:</strong> {credentials.password}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogAction
              onClick={() => {
                setShowDialog(false);
                navigate("/");
              }}
            >
              OK
            </AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog> */}
        {/* <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
          <AlertDialogTrigger />
          <AlertDialogContent>
            <AlertDialogHeader className="mb-2">
              <AlertDialogTitle className="font-semibold text-lg">
                🎉 Registration Complete!
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-gray-600">
                Your account has been successfully created. Please keep your
                credentials safe.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="my-4 px-2">
              <p>
                <strong>Username:</strong> {credentials.username}
              </p>
              <p>
                <strong>Password:</strong> {credentials.password}
              </p>
            </div>

            <AlertDialogAction
              onClick={() => {
                setShowDialog(false);
                navigate("/");
              }}
              className="mt-4 w-full"
            >
              OK
            </AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog> */}
        <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
          <AlertDialogTrigger />
          <AlertDialogContent>
            <AlertDialogHeader className="mb-2">
              <AlertDialogTitle className="font-semibold text-lg">
                🎉 Registration Complete!
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-gray-600">
                Your account has been successfully created. Please keep your
                credentials safe.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="my-4 space-y-3 px-2">
              {/* Username Card */}
              <div className="flex items-center justify-between gap-3 border rounded-md p-3 shadow-sm bg-white">
                <div className="flex items-center gap-3">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Username</p>
                    <p className="text-sm font-normal text-gray-800">
                      {credentials.username}
                    </p>
                  </div>
                </div>
              </div>

              {/* Password Card */}
              <div className="flex items-center justify-between gap-3 border rounded-md p-3 shadow-sm bg-white">
                <div className="flex items-center gap-3">
                  <KeySquare className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Password</p>
                    <p className="text-sm font-normal text-gray-800">
                      {credentials.password}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <Button
                onClick={handleCopyDetails}
                className=" w-full inline-flex items-center justify-center gap-2 rounded-md  px-4 py-2  shadow transition-colors  focus:outline-none"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Credentials Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Credentials
                  </>
                )}
              </Button>

              <AlertDialogAction
                onClick={() => {
                  setShowDialog(false);
                  navigate("/");
                }}
                className=" w-full"
              >
                OK
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </form>
  );
};

export default Register;
