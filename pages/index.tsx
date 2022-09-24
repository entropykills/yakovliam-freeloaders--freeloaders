import { Box, Button, Heading, Text, Image } from "grommet";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useUser } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { PackageValueResponse } from "../types/packageValueResponse";
import useSWR from "swr";

const fetcher = (args: any) => fetch(args).then((res) => res.json());

const Home: NextPage = () => {
  const router = useRouter();
  const user = useUser();

  const [totalPackageValue, setTotalPackageValue] =
    useState<PackageValueResponse | null>();

  const { data: totalPackageValueData, error: totalPackageError } = useSWR(
    "/api/getTotalPackageValue",
    fetcher,
    {
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        // Never retry on 404.
        if (error.status === 404) return;

        // Only retry up to 10 times.
        if (retryCount >= 10) return;

        // Retry after 5 seconds.
        setTimeout(() => revalidate({ retryCount }), 2000);
      },
      loadingTimeout: 3000,
    }
  );

  useEffect(() => {
    if (totalPackageError) {
      console.error(totalPackageError);
      return;
    }

    if (totalPackageValueData) {
      setTotalPackageValue(totalPackageValueData);
      return;
    }
  }, [totalPackageError, totalPackageValueData]);

  return (
    <>
      <Head>
        <title>UC FreeLoaders</title>
        <meta name="description" content="Pay less for essential services" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box
        align="center"
        direction="column"
        gap="large"
        background="white"
        pad="medium"
        flex="grow"
      >
        <Box align="center" direction="column">
          <Heading>FreeLoaders</Heading>
          <Text>
            pay less for <em>essential</em> services!
          </Text>
        </Box>
        <Box align="center">
          <Button
            primary
            label={user ? "visit the dashboard" : "get started"}
            onClick={() => {
              if (!user) {
                router.push("/enter");
              } else {
                router.push("/dashboard");
              }
            }}
          />
        </Box>
        {totalPackageValue ? (
          <Box align="center">
            <Text size="xlarge">we&apos;ve saved uc students</Text>
            <Text size="3xl" weight={"bold"} color="status-ok">
              ${totalPackageValue?.value}
            </Text>
            <Text size="xlarge">so far</Text>
          </Box>
        ) : (
          <></>
        )}
      </Box>
    </>
  );
};

export default Home;
