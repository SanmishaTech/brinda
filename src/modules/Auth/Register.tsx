import { useEffect, useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useNavigate } from "react-router-dom";
import { get, post } from "@/services/apiService";
import { appName } from "@/config";
import { LoaderCircle, ChevronsUpDown, Check } from "lucide-react"; // Spinner icon
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
// Define expected API response structure
interface RegisterResponse {
  message: string;
}

type RegisterFormInputs = z.infer<typeof registerSchema>;

// Define Zod schema
const registerSchema = z.object({
  sponsorId: z.string().min(1, "Sponsor ID is required"),
  name: z.string().nonempty("Name is required"),
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
  const [showDialog, setShowDialog] = useState(false);
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [sponsorName, setSponsorName] = useState<string | null>(null);

  const defaultValues = {
    sponsorId: "",
    name: "",
    email: "",
    state: "",
    mobile: "",
    position: "",
  };

  const {
    register,
    handleSubmit,
    setError,
    setValue,
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

  // sponsor Details
  const { data: sponsorData, isLoading: isSponsorLoading } = useQuery({
    queryKey: ["sponsorData", sponsorId],
    queryFn: async () => {
      const response = await get(`/members/${sponsorId}`);
      return response;
    },
    enabled: sponsorId?.length === 8, // 👈 only call when exactly 8 characters
    retry: false, // prevent retry on 404
  });

  const isSponsorValid =
    sponsorId.length === 8 && sponsorData && !isSponsorLoading;

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

  const onSubmit: SubmitHandler<RegisterFormInputs> = (data) => {
    registerMutation.mutate(data);
  };

  return (
    <form className="p-4 md:p-6 md:pt-2" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col space-y-3">
        <div className="flex flex-col items-center text-center space-y-2">
          <h1 className="text-2xl font-bold">Create an Account</h1>
          <p className="text-balance text-muted-foreground">
            Register for your {appName} account
          </p>
        </div>
        <div className="flex flex-col space-y-6">
          <div className="grid gap-2 relative">
            <Label
              htmlFor="sponsorId"
              className="flex justify-between items-center"
            >
              <span>Sponsor ID</span>
              <span className="text-xs ml-2">
                {sponsorId === "" ? null : isSponsorLoading ? (
                  <span className="text-muted-foreground">
                    Verifying sponsor...
                  </span>
                ) : sponsorId.length === 8 ? (
                  sponsorData ? (
                    <span className="text-green-600">
                      Sponsor Name: {sponsorData.sponsor.memberName}
                    </span>
                  ) : (
                    <span className="text-red-500">Invalid Sponsor ID</span>
                  )
                ) : (
                  <span className="text-red-500">Invalid Sponsor ID</span>
                )}
              </span>
            </Label>

            <Input
              id="sponsorId"
              type="text"
              placeholder="Enter Sponsor ID"
              {...register("sponsorId")}
              required
              disabled={registerMutation.isPending}
            />
            {errors.sponsorId && (
              <span className="text-destructive text-xs absolute -bottom-5">
                {errors.sponsorId.message}
              </span>
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
          <div className="grid gap-2 relative">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              {...register("name")}
              required
              disabled={registerMutation.isPending}
            />
            {errors.name && (
              <span className="text-destructive text-xs absolute -bottom-5">
                {errors.name.message}
              </span>
            )}
          </div>
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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              {...register("email")}
              disabled={registerMutation.isPending}
            />
            {errors.email && (
              <p className="text-destructive text-xs absolute -bottom-5">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="grid gap-2 relative">
            <Label htmlFor="mobile">Mobile</Label>
            <Input
              id="mobile"
              {...register("mobile")}
              maxLength={10}
              placeholder="Enter mobile number"
            />
            {errors.mobile && (
              <p className="text-destructive text-xs absolute -bottom-5">
                {errors.mobile.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={registerMutation.isPending || !isSponsorValid}
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
        <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
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
        </AlertDialog>
      </div>
    </form>
  );
};

export default Register;
